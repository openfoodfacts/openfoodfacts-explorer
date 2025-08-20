// See https://kit.svelte.dev/docs/types#app

import type { ProductStateError } from '$lib/api';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			errors?: ProductStateError[];
			actions?: { label: string; url?: string }[];
		}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			currentStep?: number;
		}
		// interface Platform {}
	}

	interface Window {
		_paq: string[][];
		L?: typeof import('leaflet');
	}
}

export {};
