import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { MUST_BE_STRING_ERROR } from '../../../common/constants/common.constants';
import {
	COMPANY_NAME_MIN_ERROR,
	COMPANY_REGISTERED_MIN_ERROR,
} from '../constants/company.constant';

export class CompanyCreateDto {
	@IsString({ message: MUST_BE_STRING_ERROR })
	@MinLength(4, { message: COMPANY_NAME_MIN_ERROR })
	name: string;

	@IsOptional()
	@IsString({ message: MUST_BE_STRING_ERROR })
	@MinLength(5, { message: COMPANY_REGISTERED_MIN_ERROR })
	registeredName?: string;

	@IsOptional()
	@IsString({ message: MUST_BE_STRING_ERROR })
	description?: string;

	@IsOptional()
	@IsString({ message: MUST_BE_STRING_ERROR })
	ownerId?: string;

	@IsOptional()
	@IsString({ message: MUST_BE_STRING_ERROR })
	@IsEmail()
	ownerEmail?: string;

	@IsOptional()
	@IsString({ message: MUST_BE_STRING_ERROR })
	memberId?: string;
}
