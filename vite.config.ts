import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { version as packageVersion } from './package.json';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
	server: {
		proxy: {
			'/api/search': {
				target: 'https://search.openfoodfacts.org',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/search/, '')
			}
		}
	},
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'openfoodfacts',
				project: 'openfoodfacts-explorer'
			}
		}),
		sveltekit(),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/@openfoodfacts/openfoodfacts-webcomponents/dist/assets/**/*',
					dest: 'assets/webcomponents'
				}
			]
		})
	],
	define: {
		'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageVersion)
	}
});
