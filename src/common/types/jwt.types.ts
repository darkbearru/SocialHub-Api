import { UserRole } from './user.types';

export type TJwtPayload = {
	id: string;
	name: string;
	role: UserRole[];
};

export type JwtTokens = {
	accessToken: string;
	refreshToken: string;
};

export type TJwtResponse = JwtTokens & { user: TJwtPayload };
