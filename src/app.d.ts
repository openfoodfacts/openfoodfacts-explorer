// See https://kit.svelte.dev/docs/types#app

import type { ProductStateError } from '#lib/api.js';
import type { ServerTiming } from '#lib/server/timing.ts';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			errors?: (ProductStateError | string)[];
			actions?: { label: string; url?: string }[];
		}
		interface Locals {
			timing: ServerTiming;
		}
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
