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
				'script-src': ['self', 'https://va.vercel-scripts.com/'],
				'img-src': [
					'self',
					'data:',
					'https://*.openfoodfacts.org/',
					'https://tile.openstreetmap.org'
				],
				'style-src': ['self', 'unsafe-inline'],
				'frame-ancestors': ['none']
			}
		}
	}
};

export default config;
