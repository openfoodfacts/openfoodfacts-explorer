// See https://kit.svelte.dev/docs/types#app

import type { ProductStateError } from '$lib/api';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			errors?: (ProductStateError | string)[];
			actions?: { label: string; url?: string }[];
		}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			currentStep?: number;
		}
		// interface Platform {}
	}

	namespace NodeJS {
		interface ProcessEnv {
			readonly PUBLIC_FOLKSONOMY_API_URL?: string;
			readonly PUBLIC_OFF_BASE_URL?: string;
			readonly PUBLIC_SEARCH_BASE_URL?: string;
			readonly PUBLIC_PRICES_API_URL?: string;
		}
	}

	interface Window {
		_paq: string[][];
		L?: typeof import('leaflet');
	}
}

export {};
