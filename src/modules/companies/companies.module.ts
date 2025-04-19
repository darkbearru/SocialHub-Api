import { Module } from '@nestjs/common';
import { UserSchema } from '../users/model/users.model';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompanySchema } from './model/company.model';
import { UsersService } from '../users/users.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { USER_MODEL } from '../users/constants/user.constants';
import { COMPANY_MODEL } from './constants/company.constant';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: COMPANY_MODEL,
				schema: CompanySchema,
				collection: 'Company',
			},
			{
				name: USER_MODEL,
				schema: UserSchema,
				collection: 'User',
			},
		]),
	],
	providers: [CompaniesService, UsersService, SubscriptionService],
	controllers: [CompaniesController],
	exports: [],
})
export class CompaniesModule {}
