import { UserRole } from './user.types';
import { TSubscription } from '../../modules/subscription/subscription.types';

export type TJwtPayload = {
	id: string;
	name: string;
	role: UserRole[];
	subscription: TSubscription;
};

export type JwtTokens = {
	accessToken: string;
	refreshToken: string;
};

export type TJwtResponse = JwtTokens & { user: TJwtPayload };
