import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
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
