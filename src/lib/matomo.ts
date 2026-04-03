import { writable } from 'svelte/store';

export type MatomoTracker = {
	trackEvent: (category: string, action: string, name?: string, value?: number) => void;
};

const noopTracker: MatomoTracker = {
	trackEvent: () => {
		// Analytics is optional in local/dev environments.
	}
};

export const tracker = writable<MatomoTracker>(noopTracker);
