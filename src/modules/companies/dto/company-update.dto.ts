import { IsString, MinLength } from 'class-validator';
import { MUST_BE_STRING_ERROR } from '../../../common/constants/common.constants';
import {
	COMPANY_NAME_MIN_ERROR,
	COMPANY_REGISTERED_MIN_ERROR,
} from '../constants/company.constant';

export class CompanyUpdateDto {
	@IsString({ message: MUST_BE_STRING_ERROR })
	@MinLength(4, { message: COMPANY_NAME_MIN_ERROR })
	name?: string;

	@IsString({ message: MUST_BE_STRING_ERROR })
	@MinLength(5, { message: COMPANY_REGISTERED_MIN_ERROR })
	registeredName?: string;

	@IsString({ message: MUST_BE_STRING_ERROR })
	description?: string;
}
