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
let installPrompt = $state<BeforeInstallPromptEvent | null>(null);

export const pwaInstallStore = {
	get value(): BeforeInstallPromptEvent | null {
		return installPrompt;
	},
	capture: (event: BeforeInstallPromptEvent) => {
		installPrompt = event;
	},
	clear: () => {
		installPrompt = null;
	}
};
