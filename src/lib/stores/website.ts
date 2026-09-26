import { createContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';
import type { WebsiteFlavor } from '$lib/flavor';

export type WebsiteContext = {
	flavor: WebsiteFlavor;
	forcedFlavor: WebsiteFlavor | null;
};

export type WebsiteContextStore = Writable<WebsiteContext>;

export const [getWebsiteCtx, setWebsiteCtx] = createContext<WebsiteContextStore>();

export function createWebsiteCtx(): WebsiteContextStore {
	const websiteCtx = writable<WebsiteContext>({
		flavor: 'food',
		forcedFlavor: null
	});

	setWebsiteCtx(websiteCtx);
	return websiteCtx;
}
