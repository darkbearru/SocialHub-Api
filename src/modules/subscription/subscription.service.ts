import { BadRequestException, Injectable } from '@nestjs/common';
import { TSubscriptionSettings } from './subscription.types';
import { SUBSCRIPTION_LIST, SUBSCRIPTION_NOT_FOUND_ERROR } from './constants/subscription.constant';

@Injectable()
export class SubscriptionService {
	get(plan: string): TSubscriptionSettings {
		if (SUBSCRIPTION_LIST?.[plan] === undefined) {
			throw new BadRequestException(SUBSCRIPTION_NOT_FOUND_ERROR);
		}
		return SUBSCRIPTION_LIST?.[plan];
	}
}
