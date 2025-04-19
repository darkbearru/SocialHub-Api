import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CompanyCreateDto } from './dto/company-create.dto';
import { CompanyUpdateDto } from './dto/company-update.dto';
import { CompanyDocument } from './model/company.model';
import { UserDocument } from '../users/model/users.model';
import {
	COMPANY_ADD_ERROR,
	COMPANY_ADD_MEMBER_ERROR,
	COMPANY_DEL_MEMBER_ERROR,
	COMPANY_DELETE_ERROR,
	COMPANY_EXISTS_ERROR,
	COMPANY_MEMBERS_LIST_ERROR,
	COMPANY_MODEL,
	COMPANY_OWNER_NOT_FOUND_ERROR,
	COMPANY_REACH_LIMIT_ERROR,
	COMPANY_REGISTERED_ALREADY_EXISTS_ERROR,
	COMPANY_UPDATE_ERROR,
} from './constants/company.constant';
import { UsersService } from '../users/users.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class CompaniesService {
	private readonly logger = new Logger(CompaniesService.name, { timestamp: true });

	constructor(
		@InjectModel(COMPANY_MODEL)
		private readonly companyModel: Model<CompanyDocument>,
		private readonly usersService: UsersService,
		private readonly subscriptionService: SubscriptionService,
	) {}

	async create(
		userId: string,
		subscriptionPlan: string,
		dto: CompanyCreateDto,
	): Promise<CompanyDocument> {
		await this.checkSubscriptionLimits(userId, subscriptionPlan);
		dto = { ...dto, registeredName: dto?.registeredName ?? dto.name };

		if (await this.companyModel.findOne({ registeredName: dto.registeredName }).exec()) {
			throw new BadRequestException(COMPANY_EXISTS_ERROR);
		}
		if (!(await this.checkRegisteredName(dto.registeredName))) {
			throw new BadRequestException(COMPANY_REGISTERED_ALREADY_EXISTS_ERROR);
		}

		dto.ownerId = await this.checkOrCreateOwner(dto);

		return await this.addCompany(userId, dto);
	}

	async update(id: string, dto: CompanyUpdateDto) {
		const company = await this.companyModel.findById(id).exec();
		if (!company) {
			throw new NotFoundException(COMPANY_EXISTS_ERROR);
		}
		if (dto.registeredName && !(await this.checkRegisteredName(dto.registeredName, id))) {
			throw new BadRequestException(COMPANY_REGISTERED_ALREADY_EXISTS_ERROR);
		}
		try {
			return await this.companyModel.findByIdAndUpdate(id, { dto }).exec();
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException(COMPANY_UPDATE_ERROR);
		}
	}

	async delete(id: string) {
		const company = await this.companyModel.findById(id).exec();
		if (!company) {
			throw new NotFoundException(COMPANY_EXISTS_ERROR);
		}
		try {
			await company.deleteOne().exec();
			await this.usersService.removeCompany(id);
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException(COMPANY_DELETE_ERROR);
		}
	}

	async get(id: string) {
		try {
			return await this.companyModel
				.findById(id)
				.populate('owner', 'name email')
				.populate('members', 'name email');
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException(COMPANY_EXISTS_ERROR);
		}
	}

	async addMember(companyId: string, userId: string) {
		await this.usersService.addCompany(userId, companyId);
		try {
			return this.companyModel
				.updateOne({ _id: companyId }, { $addToSet: { members: new Types.ObjectId(userId) } })
				.exec();
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException(COMPANY_ADD_MEMBER_ERROR);
		}
	}

	async removeMember(companyId: string, userId: string) {
		await this.usersService.removeCompany(companyId, userId);
		try {
			return this.companyModel
				.updateOne({ _id: companyId }, { $pull: { members: new Types.ObjectId(userId) } })
				.exec();
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException(COMPANY_DEL_MEMBER_ERROR);
		}
	}

	async getMembers(id: string) {
		const company = await this.companyModel.findById(id).exec();
		if (!company) {
			throw new NotFoundException(COMPANY_EXISTS_ERROR);
		}
		try {
			const members = await this.usersService.findManyByIds(company.members);
			return members.map((member) => ({
				name: member.name,
				email: member.email,
			}));
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException(COMPANY_MEMBERS_LIST_ERROR);
		}
	}

	private async checkSubscriptionLimits(userId: string, subscriptionPlan: string): Promise<void> {
		const subscription = this.subscriptionService.get(subscriptionPlan);
		const countCompanies: number = await this.countUserCompanies(userId);

		if (countCompanies >= subscription.companiesCount) {
			throw new ForbiddenException(COMPANY_REACH_LIMIT_ERROR);
		}
	}

	private async countUserCompanies(userId: string): Promise<number> {
		return this.companyModel.countDocuments({ members: userId });
	}

	private async checkOrCreateOwner(dto: CompanyCreateDto): Promise<string> {
		if (dto.ownerId) {
			const owner = await this.usersService.findById(dto.ownerId);
			if (!owner) {
				throw new BadRequestException(COMPANY_OWNER_NOT_FOUND_ERROR);
			}
			return dto.ownerId;
		}
		return await this.createAndGetOwnerId(dto);
	}

	private async createAndGetOwnerId(dto: CompanyCreateDto): Promise<string> {
		let owner: UserDocument;
		if (dto.ownerEmail) {
			owner = await this.usersService.findByEmail(dto.ownerEmail);
		}
		if (!owner) {
			owner = await this.usersService.create({
				email: dto.ownerEmail,
				name: dto.name,
				password: new Types.ObjectId().toHexString(),
			});
		}
		return owner.id;
	}

	private async checkRegisteredName(registeredName: string, id?: string): Promise<boolean> {
		try {
			const company = await this.companyModel.findOne({ registeredName, _id: { $ne: id } }).exec();
			if (!company) return true;
		} catch (e) {
			this.logger.error(e);
		}
		return true;
	}

	private async addCompany(userId: string, dto: CompanyCreateDto): Promise<CompanyDocument> {
		let result: CompanyDocument;
		try {
			const newCompany = new this.companyModel({
				name: dto.name,
				registeredName: dto.registeredName,
				description: dto.description,
				owner: dto.ownerId,
				members: [userId],
			});
			result = (await newCompany.save()) as CompanyDocument;
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException(COMPANY_ADD_ERROR);
		}
		await this.usersService.addCompany(userId, result.id);
		return result;
	}
}
