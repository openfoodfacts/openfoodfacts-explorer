import { getContext, setContext } from 'svelte';

type WebsiteContext = {
	flavor: 'beauty' | 'food' | 'petfood' | 'product';
};

export function setWebsiteCtx(ctx: () => WebsiteContext) {
	setContext('website-ctx', ctx);
}

export function getWebsiteCtx() {
	const lambda = getContext('website-ctx') as () => WebsiteContext;
	return lambda();
}
