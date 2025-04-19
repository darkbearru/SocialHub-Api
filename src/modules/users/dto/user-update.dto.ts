import { IsOptional, IsString, MinLength } from 'class-validator';

export class UserUpdateDto {
	@IsString()
	name?: string;

	@IsString()
	@MinLength(5)
	passwordOld?: string;

	@IsString()
	@MinLength(5)
	passwordNew?: string;

	@IsOptional()
	@IsString()
	refreshToken?: string;
}
