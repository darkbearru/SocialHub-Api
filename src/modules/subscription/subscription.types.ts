export enum SubscriptionPlan {
	Personal = 'personal',
	Basic = 'basic',
	Pro = 'pro',
}
export type TSubscription = {
	plan: SubscriptionPlan;
	expiredAt: Date | null;
};

export type TSubscriptionSettings = {
	companiesCount: number;
	socialNetworkCount: number;
	tapLinksCount: number;
	canUseTemplate: boolean;
	canUseTapLink: boolean;
	canUsePending: boolean;
	canUseGlavred: boolean;
	canUseTypechecking: boolean;
	canUseAI: boolean;
};

export type TSubscriptionList = Record<SubscriptionPlan, TSubscriptionSettings>;
