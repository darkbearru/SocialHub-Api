export enum SubscriptionPlan {
	Personal = 'personal',
	Basic = 'basic',
	Pro = 'pro',
}
export type TUserSubscription = {
	plan: SubscriptionPlan;
	expiredAt: Date | null;
};
