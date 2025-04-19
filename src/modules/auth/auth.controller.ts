import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { UserCreateDto } from '../users/dto/user-create.dto';
import { AccessTokenGuard } from '../../common/guards/accessToken.guards';
import { RefreshTokenGuard } from '../../common/guards/refreshToken.guards';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe())
	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Body() dto: UserLoginDto) {
		return this.authService.login(dto);
	}

	@UsePipes(new ValidationPipe())
	@Post('register')
	async register(@Body() dto: UserCreateDto) {
		return this.authService.register(dto);
	}

	@UseGuards(AccessTokenGuard)
	@Get('check')
	async check() {
		return { message: 'OK', statusCode: HttpStatus.OK };
	}

	@UseGuards(RefreshTokenGuard)
	@Get('refresh')
	refreshTokens(@Req() req: Request) {
		const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
		const userId = req.user['id'];
		return this.authService.refresh(userId, refreshToken);
	}

	@UseGuards(AccessTokenGuard)
	@Get('logout')
	async logout(@Req() req: Request) {
		return this.authService.logout(req.user['id']);
	}
}
