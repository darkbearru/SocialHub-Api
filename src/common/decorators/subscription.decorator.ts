import { SetMetadata } from '@nestjs/common';
import { SubscriptionPlan } from '../../modules/subscription/subscription.types';

export const SUBSCRIPTION_KEY = 'subscriptions';
export const Subscriptions = (...subscriptions: SubscriptionPlan[]) =>
	SetMetadata(SUBSCRIPTION_KEY, subscriptions);
