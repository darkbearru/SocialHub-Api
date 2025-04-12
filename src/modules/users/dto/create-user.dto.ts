import { IsEmail, IsString, MinLength } from 'class-validator';
import {
	USER_NAME_MIN_ERROR,
	USER_NOT_EMAIL_ERROR,
	USER_PASSWORD_MIN_ERROR,
} from '../constants/user.constants';
import { MUST_BE_STRING_ERROR } from '../../../common/constants/common.constants';

export class CreateUserDto {
	@IsString({ message: MUST_BE_STRING_ERROR })
	@IsEmail({}, { message: USER_NOT_EMAIL_ERROR })
	email: string;

	@IsString({ message: MUST_BE_STRING_ERROR })
	@MinLength(3, { message: USER_NAME_MIN_ERROR })
	name: string;

	@IsString({ message: MUST_BE_STRING_ERROR })
	@MinLength(5, { message: USER_PASSWORD_MIN_ERROR })
	password: string;
}
