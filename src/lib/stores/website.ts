import { getContext, setContext } from 'svelte';
import type { WebsiteFlavor } from '$lib/flavor';

type WebsiteContext = {
	flavor: WebsiteFlavor;
};

export function setWebsiteCtx(ctx: () => WebsiteContext) {
	setContext('website-ctx', ctx);
}

export function getWebsiteCtx() {
	const lambda = getContext('website-ctx') as () => WebsiteContext;
	if (!lambda) throw new Error('Website context not found');
	return lambda();
}
