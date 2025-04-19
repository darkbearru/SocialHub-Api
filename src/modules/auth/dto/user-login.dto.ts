import { IsEmail, IsString, MinLength } from 'class-validator';
import { MUST_BE_STRING_ERROR } from '../../../common/constants/common.constants';
import {
	USER_NOT_EMAIL_ERROR,
	USER_PASSWORD_MIN_ERROR,
} from '../../users/constants/user.constants';

export class UserLoginDto {
	@IsString({ message: MUST_BE_STRING_ERROR })
	@IsEmail({}, { message: USER_NOT_EMAIL_ERROR })
	email: string;

	@IsString({ message: MUST_BE_STRING_ERROR })
	@MinLength(5, { message: USER_PASSWORD_MIN_ERROR })
	password: string;
}
