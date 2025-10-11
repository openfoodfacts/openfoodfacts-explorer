import vercelAdapter from '@sveltejs/adapter-vercel';
import nodejsAdapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

function runningOnVercel() {
	return 'VERCEL' in process.env;
}

const adapter = runningOnVercel() ? vercelAdapter() : nodejsAdapter();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter,

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
					'https://*.openfoodfacts.net/',
					'https://*.openproductsfacts.org/',
					'https://*.openproductsfacts.net/',
					'https://*.openbeautyfacts.org/',
					'https://*.openbeautyfacts.net/',

					'https://tile.openstreetmap.org',
					'https://play.google.com',
					'https://fdroid.gitlab.io',
					'https://upload.wikimedia.org'
				],
				'style-src': ['self', 'unsafe-inline'],
				'frame-ancestors': ['none']
			}
		},

		experimental: {
			tracing: {
				server: true
			},

			instrumentation: {
				server: true
			}
		}
	}
};

export default config;
