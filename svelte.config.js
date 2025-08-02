import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		csp: {
			directives: {
				'object-src': ['none'],
				'base-uri': ['self'],
				'script-src': [
					'self',
					'unsafe-eval', // Required for Vega charts
					'https://va.vercel-scripts.com/',
					'https://analytics.openfoodfacts.org/matomo.js'
				],
				'img-src': [
					'self',
					'data:',

					'https://*.openfoodfacts.org/',
					'https://*.openproductsfacts.org/',
					'https://*.openbeautyfacts.org/',

					'https://tile.openstreetmap.org',
					'https://play.google.com',
					'https://fdroid.gitlab.io'
				],
				'style-src': ['self', 'unsafe-inline'],
				'frame-ancestors': ['none']
			}
		}
	}
};

export default config;
