import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { UserDocument } from './model/users.model';
import { InjectModel } from '@nestjs/mongoose';
import { UserCreateDto } from './dto/user-create.dto';
import {
	USER_ADD_COMPANY_ERROR,
	USER_DEL_COMPANIES_ERROR,
	USER_DEL_COMPANY_ERROR,
	USER_DELETE_ERROR,
	USER_EXISTS_ERROR,
	USER_MODEL,
	USER_NOT_FOUND_ERROR,
	USER_OLD_PASSWORD_ERROR,
} from './constants/user.constants';
import { UserUpdateDto } from './dto/user-update.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { TJwtPayload } from '../../common/types/jwt.types';
import { UserRole } from '../../common/types/user.types';

@Injectable()
export class UsersService {
	private readonly logger = new Logger(UsersService.name, { timestamp: true });

	constructor(
		@InjectModel(USER_MODEL)
		private readonly userModel: Model<UserDocument>,
	) {}

	async create(dto: UserCreateDto): Promise<UserDocument> {
		if (await this.userModel.findOne({ email: dto.email })) {
			throw new BadRequestException(USER_EXISTS_ERROR);
		}

		try {
			const newUser = new this.userModel({
				email: dto.email,
				name: dto.name,
				role: [dto.email === 'test@test.com' ? UserRole.Tester : UserRole.User],
				passwordHash: await this.makePassword(dto.password),
			});
			return await newUser.save();
		} catch (error) {
			this.logger.log(error);
			throw new BadRequestException(USER_EXISTS_ERROR);
		}
	}

	async update(id: string, dto: UserUpdateDto): Promise<UserDocument> {
		const user = await this.checkUserById(id);
		if (!(await compare(dto.passwordOld, user.passwordHash))) {
			throw new BadRequestException(USER_OLD_PASSWORD_ERROR);
		}
		return this.userModel
			.findByIdAndUpdate(id, {
				name: dto.name,
				passwordHash: await this.makePassword(dto.passwordNew),
			})
			.exec();
	}

	async delete(id: string): Promise<UserDocument> {
		try {
			return await this.userModel.findByIdAndDelete(id).exec();
		} catch (error) {
			this.logger.log(error);
			throw new BadRequestException(USER_DELETE_ERROR);
		}
	}

	async findById(id: string): Promise<UserDocument> {
		return this.userModel.findById({ _id: id }).exec();
	}

	async findManyByIds(ids: string[] | Types.ObjectId[]): Promise<UserDocument[]> {
		return this.userModel.find({ _id: { $in: ids } }).exec();
	}

	async findByEmail(email: string): Promise<UserDocument> {
		return this.userModel.findOne({ email });
	}

	async addCompany(userId: string, companyId: string) {
		await this.checkUserById(userId);
		try {
			return this.userModel.updateOne({ _id: userId }, { $addToSet: { companies: companyId } });
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException(USER_ADD_COMPANY_ERROR);
		}
	}

	async removeCompany(companyId: string, userId?: string) {
		if (!userId) {
			try {
				return this.userModel.updateMany(
					{ companies: companyId },
					{ $pull: { companies: companyId } },
				);
			} catch (e) {
				this.logger.error(e);
				throw new BadRequestException(USER_DEL_COMPANIES_ERROR);
			}
		}
		await this.checkUserById(userId);
		try {
			return this.userModel.updateOne({ _id: userId }, { $pull: { companies: companyId } });
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException(USER_DEL_COMPANY_ERROR);
		}
	}

	async updateRefreshToken(
		payload: TJwtPayload | string,
		refreshToken?: string,
	): Promise<UserDocument> {
		let refreshTokenHash = null;
		if (refreshToken) {
			const salt = await genSalt(10);
			refreshTokenHash = await hash(refreshToken, salt);
		}
		const id: string = typeof payload === 'string' ? payload : payload.id;
		return await this.userModel
			.findByIdAndUpdate(id, {
				refreshToken: refreshTokenHash,
			})
			.exec();
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
