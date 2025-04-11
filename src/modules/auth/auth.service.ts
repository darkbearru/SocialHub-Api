import {
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { TJwtPayload, TJwtResponse } from '../../common/types/jwt.types';
import { USER_NOT_FOUND_ERROR } from '../users/constants/user.constants';
import { compare } from 'bcryptjs';
import { AUTH_NO_ACCESS_ERROR, AUTH_WRONG_PASSWORD_ERROR } from './constants/auth.constants';
import { UserDocument } from '../users/model/users.model';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
	) {}

	async login({ email, password }: LoginUserDto) {
		const payload: TJwtPayload = await this.validateUser(email, password);
		return await this.makeTokensAndPayload(payload);
	}

	async register(dto: CreateUserDto) {
		const user = await this.usersService.create(dto);
		return await this.makeTokensAndPayload(user);
	}

	async logout(id: string): Promise<UserDocument> {
		return await this.usersService.update(id, { refreshToken: null });
	}

	async refresh(id: string, refreshToken: string) {
		const user = await this.usersService.findById(id);
		if (!user || !user.refreshToken) throw new ForbiddenException(AUTH_NO_ACCESS_ERROR);

		const isCorrectToken = await compare(refreshToken, user.refreshToken);
		if (!isCorrectToken) throw new ForbiddenException(AUTH_NO_ACCESS_ERROR);

		return this.makeTokensAndPayload(user);
	}

	private async makeTokensAndPayload(user: UserDocument | TJwtPayload): Promise<TJwtResponse> {
		let payload: TJwtPayload;
		if ((user as UserDocument)?.passwordHash) {
			payload = this.makePayload(user as UserDocument);
		} else {
			payload = user as TJwtPayload;
		}
		const tokens = await this.getTokens(payload);
		await this.usersService.updateRefreshToken(payload, tokens.refreshToken);

		return { ...tokens, user: payload };
	}

	private makePayload(user: UserDocument): TJwtPayload {
		const { id, name, role } = user;
		return { id, name, role };
	}

	private async validateUser(email: string, password: string): Promise<TJwtPayload> {
		const user = await this.usersService.findByEmail(email);
		if (!user) {
			throw new NotFoundException(USER_NOT_FOUND_ERROR);
		}
		const isCorrectPassword = await compare(password, user.passwordHash);
		if (!isCorrectPassword) {
			throw new UnauthorizedException(AUTH_WRONG_PASSWORD_ERROR);
		}
		return { id: user.id, name: user.name, role: user.role };
	}

	private async getTokens(payload: TJwtPayload) {
		const [accessToken, refreshToken] = await Promise.all([
			this.getToken(payload, 'ACCESS'),
			this.getToken(payload, 'REFRESH'),
		]);
		return {
			accessToken,
			refreshToken,
		};
	}

	private getToken(payload: TJwtPayload, tokenName: string = 'ACCESS') {
		return this.jwtService.signAsync(payload, {
			secret: this.configService.get<string>(`JWT_${tokenName}_SECRET`),
			expiresIn: this.configService.get<string>(`JWT_${tokenName}_EXPIRES`),
		});
	}
}
