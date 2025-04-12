import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from '../../common/guards/accessToken.guards';
import { UserRole } from '../../common/types/user.types';
import { RolesGuard } from '../../common/guards/user-roles.guards';
import { Roles } from '../../common/decorators/user-roles.decorator';
import { IdValidationPipe } from '../../common/pipes/id-validation.pipe';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@UseGuards(AccessTokenGuard, RolesGuard)
	@Roles(UserRole.Admin, UserRole.Tester)
	@Delete(':id')
	async delete(@Param('id', IdValidationPipe) id: string) {
		return this.usersService.delete(id);
	}
}
