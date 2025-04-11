import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { UserDocument, UserModel } from './model/users.model';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import {
	USER_EXISTS_ERROR,
	USER_NOT_FOUND_ERROR,
	USER_OLD_PASSWORD_ERROR,
} from './constants/user.constants';
import { UpdateUserDto } from './dto/update-user.dto';
import { genSalt, hash } from 'bcryptjs';
import { TJwtPayload } from '../../common/types/jwt.types';

@Injectable()
export class UsersService {
	private readonly logger = new Logger(UsersService.name, { timestamp: true });

	constructor(
		@InjectModel(UserModel.name)
		private readonly userModel: Model<UserDocument>,
	) {}

	async create(dto: CreateUserDto): Promise<UserDocument> {
		if (await this.userModel.findOne({ email: dto.email })) {
			throw new BadRequestException(USER_EXISTS_ERROR);
		}
		try {
			const newUser = new this.userModel({
				email: dto.email,
				name: dto.name,
				passwordHash: await this.makePassword(dto.password),
			});
			return await newUser.save();
		} catch (error) {
			this.logger.log(error);
			throw new BadRequestException(USER_EXISTS_ERROR);
		}
	}

	async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
		const user = await this.checkUserById(id);
		const passwordOld = await this.makePassword(dto.passwordOld);
		if (user.passwordHash !== passwordOld) {
			throw new BadRequestException(USER_OLD_PASSWORD_ERROR);
		}
		return this.userModel
			.findByIdAndUpdate(id, {
				name: dto.name,
				passwordHash: await this.makePassword(dto.passwordNew),
			})
			.exec();
	}

	async findById(id: string): Promise<UserDocument> {
		return this.userModel.findById({ _id: id });
	}

	async findByEmail(email: string): Promise<UserDocument> {
		return this.userModel.findOne({ email });
	}

	async addCompany(userId: string, companyId: string): Promise<UserDocument> {
		const user = await this.checkUserById(userId);
		// const company = await this.findById(companyId);
		const id = new Types.ObjectId(companyId);
		if (user.companies.includes(id)) return user;
		user.companies.push(id);
		return await user.save();
	}

	async removeCompany(userId: string, companyId: string): Promise<UserDocument> {
		const user = await this.checkUserById(userId);
		const id = new Types.ObjectId(companyId);
		const idx = user.companies.findIndex((company) => company === id);
		user.companies.splice(idx, 1);
		return await user.save();
	}

	async updateRefreshToken(payload: TJwtPayload, refreshToken: string): Promise<void> {
		const salt = await genSalt(10);
		const refreshTokenHash = await hash(refreshToken, salt);
		await this.userModel.findByIdAndUpdate(payload.id, {
			refreshToken: refreshTokenHash,
		});
	}

	private async checkUserById(id: string): Promise<UserDocument> {
		const user = await this.userModel.findOne({ _id: id }).exec();
		if (!user) {
			throw new NotFoundException(USER_NOT_FOUND_ERROR);
		}
		return user;
	}

	private async makePassword(password: string): Promise<string> {
		const salt = await genSalt(10);
		return await hash(password, salt);
	}
}
