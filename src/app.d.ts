// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			errors?: {
				field: { id: string; value: string };
				impact: { lc_name: string; name: string; id: string };
				message: { lc_name: string; name: string; id: string };
			}[];
		}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			currentStep?: number;
		}
		// interface Platform {}
	}
}

declare global {
	interface Window {
		_paq: string[][];
		L?: typeof import('leaflet');
	}
}

export {};
