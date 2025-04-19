import { TSubscriptionList } from '../subscription.types';

export const SUBSCRIPTION_NOT_FOUND_ERROR = 'subscriptionNotFoundError';

export const SUBSCRIPTION_LIST: TSubscriptionList = {
	personal: {
		companiesCount: 1,
		socialNetworkCount: 3,
		tapLinksCount: 0,
		canUseTemplate: false,
		canUseTapLink: false,
		canUsePending: false,
		canUseGlavred: false,
		canUseTypechecking: false,
		canUseAI: false,
	},
	basic: {
		companiesCount: 3,
		socialNetworkCount: 5,
		tapLinksCount: 3,
		canUseTemplate: true,
		canUseTapLink: true,
		canUsePending: true,
		canUseGlavred: false,
		canUseTypechecking: false,
		canUseAI: false,
	},
	pro: {
		companiesCount: 100,
		socialNetworkCount: 100,
		tapLinksCount: 100,
		canUseTemplate: true,
		canUseTapLink: true,
		canUsePending: true,
		canUseGlavred: true,
		canUseTypechecking: true,
		canUseAI: true,
	},
} as const;
