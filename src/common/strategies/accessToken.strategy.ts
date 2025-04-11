import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TJwtPayload } from '../types/jwt.types';

export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env?.JWT_ACCESS_SECRET,
		});
	}

	async validate(payload: TJwtPayload) {
		return payload;
	}
}
