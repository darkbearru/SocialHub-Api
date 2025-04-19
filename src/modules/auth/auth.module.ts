import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { UserSchema } from '../users/model/users.model';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccessTokenStrategy } from '../../common/strategies/accessToken.strategy';
import { RefreshTokenStrategy } from '../../common/strategies/refreshToken.strategy';
import { USER_MODEL } from '../users/constants/user.constants';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: USER_MODEL,
				schema: UserSchema,
				collection: 'User',
			},
		]),
		JwtModule.register({}),
	],
	providers: [AuthService, UsersService, ConfigService, AccessTokenStrategy, RefreshTokenStrategy],
	controllers: [AuthController],
})
export class AuthModule {}
