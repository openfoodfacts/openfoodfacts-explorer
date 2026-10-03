import { writable } from 'svelte/store';

/**
 * Type of the BeforeInstallPromptEvent, which is not (yet) part of the
 * standard TypeScript DOM typings.
 */
export type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

/**
 * Holds the deferred `beforeinstallprompt` event so that a UI element
 * (e.g. the install button in Settings) can trigger it later.
 *
 * The browser fires `beforeinstallprompt` once, early in the page life,
 * if the site is installable. We capture it as soon as possible (root
 * layout) and store it here, because the user may not open Settings
 * until much later.
 */
const installPrompt = writable<BeforeInstallPromptEvent | null>(null);

export const pwaInstallStore = {
	subscribe: installPrompt.subscribe,
	capture: (event: BeforeInstallPromptEvent) => installPrompt.set(event),
	clear: () => installPrompt.set(null)
};
