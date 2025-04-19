import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Req,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanyCreateDto } from './dto/company-create.dto';
import { AccessTokenGuard } from '../../common/guards/accessToken.guards';
import { Request } from 'express';
import { TJwtPayload } from '../../common/types/jwt.types';
import { CompanyUpdateDto } from './dto/company-update.dto';
import { IdValidationPipe } from '../../common/pipes/id-validation.pipe';

@Controller('companies')
export class CompaniesController {
	constructor(private readonly companiesService: CompaniesService) {}

	@UseGuards(AccessTokenGuard)
	@UsePipes(new ValidationPipe())
	@Post()
	create(@Req() req: Request, @Body() dto: CompanyCreateDto) {
		const user = req.user as TJwtPayload;
		return this.companiesService.create(user.id, user.subscription.plan, dto);
	}

	@UseGuards(AccessTokenGuard)
	@UsePipes(new ValidationPipe())
	@Patch(':id')
	update(@Param('id', IdValidationPipe) id: string, @Body() dto: CompanyUpdateDto) {
		return this.companiesService.update(id, dto);
	}

	@UseGuards(AccessTokenGuard)
	@Delete(':id')
	delete(@Param('id', IdValidationPipe) id: string) {
		return this.companiesService.delete(id);
	}

	@UseGuards(AccessTokenGuard)
	@Get(':id')
	getCompany(@Param('id', IdValidationPipe) id: string) {
		return this.companiesService.get(id);
	}

	@UseGuards(AccessTokenGuard)
	@UsePipes(new ValidationPipe())
	@Get(':companyId/addMember/:userId/')
	@HttpCode(HttpStatus.OK)
	addMember(
		@Param('companyId', IdValidationPipe) companyId: string,
		@Param('userId', IdValidationPipe) userId: string,
	) {
		return this.companiesService.addMember(companyId, userId);
	}

	@UseGuards(AccessTokenGuard)
	@UsePipes(new ValidationPipe())
	@Delete(':companyId/removeMember/:userId')
	removeMember(
		@Param('companyId', IdValidationPipe) companyId: string,
		@Param('userId', IdValidationPipe) userId: string,
	) {
		return this.companiesService.removeMember(companyId, userId);
	}

	@UseGuards(AccessTokenGuard)
	@Get(':id/getMembers')
	getMembers(@Param('id', IdValidationPipe) id: string) {
		return this.companiesService.getMembers(id);
	}
}
