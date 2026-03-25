import { readable } from 'svelte/store';
import { type Component } from 'svelte';

export const tracker = readable({
	trackPageView: (..._args: any[]) => {},
	trackEvent: (..._args: any[]) => {},
	trackSiteSearch: (..._args: any[]) => {},
	trackLink: (..._args: any[]) => {},
	trackGoal: (..._args: any[]) => {},
	trackEcommerceOrder: (..._args: any[]) => {},
	addEcommerceItem: (..._args: any[]) => {},
	setCustomVariable: (..._args: any[]) => {},
	setDocumentTitle: (..._args: any[]) => {},
	setCustomUrl: (..._args: any[]) => {},
	setReferrerUrl: (..._args: any[]) => {},
	setUserId: (..._args: any[]) => {},
	setGenerationTimeMs: (..._args: any[]) => {},
	setHeartBeatTimer: (..._args: any[]) => {},
	enableLinkTracking: (..._args: any[]) => {},
	enableCrossDomainLinking: (..._args: any[]) => {},
	setCookieDomain: (..._args: any[]) => {},
	setDomains: (..._args: any[]) => {},
	push: (..._args: any[]) => {}
});

// Mock component
export const Matomo: Component<{ url: string; siteId: number }> = {} as any;
