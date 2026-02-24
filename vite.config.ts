import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { version as packageVersion } from './package.json';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
	const isTest = mode === 'test' || process.env.VITEST;

	return {
		server: isTest
			? undefined
			: {
					proxy: {
						'/api/search': {
							target: 'https://search.openfoodfacts.org',
							changeOrigin: true,
							rewrite: (path) => path.replace(/^\/api\/search/, '')
						}
					}
				},
		plugins: [
			!isTest && tailwindcss(),
			!isTest &&
				sentrySvelteKit({
					sourceMapsUploadOptions: {
						org: 'openfoodfacts',
						project: 'openfoodfacts-explorer'
					}
				}),
			sveltekit(),
			!isTest &&
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
		},
		test: {
			environment: 'jsdom',
			globals: true,
			include: ['src/**/*.{test,spec}.{js,ts}'],
			coverage: {
				reporter: ['text', 'html']
			}
		}
	};
});
