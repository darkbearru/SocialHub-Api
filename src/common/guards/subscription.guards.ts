import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '../types/user.types';
import { SUBSCRIPTION_KEY } from '../decorators/subscription.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredSubscription = this.reflector.getAllAndOverride<UserRole[]>(SUBSCRIPTION_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		const { user } = context.switchToHttp().getRequest();
		const subscription = user.subscription.plan;
		return requiredSubscription.some((sub) => sub === subscription);
	}
}
