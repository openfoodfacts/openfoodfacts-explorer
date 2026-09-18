import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import pkg from './package.json' with { type: 'json' };
const packageVersion = pkg.version;
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		server: {
			proxy: {
				'/api/search': {
					target: 'https://search.openfoodfacts.org',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api\/search/, '')
				},
				'/proxy/off': {
					target: env.PUBLIC_OFF_BASE_URL || 'https://world.openfoodfacts.org',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/proxy\/off/, '')
				},
				'/proxy/robotoff': {
					target: env.PUBLIC_ROBOTOFF_URL || 'https://robotoff.openfoodfacts.org',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/proxy\/robotoff/, '')
				},
				'/proxy/facets-kp': {
					target: 'https://facets-kp.openfoodfacts.org',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/proxy\/facets-kp/, '')
				}
			}
		},
		plugins: [
			tailwindcss(),
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
						src: 'node_modules/@openfoodfacts/openfoodfacts-webcomponents/dist/assets/images/**/*',
						dest: 'assets/webcomponents',
						rename: {
							stripBase: 6
						}
					}
				]
			})
		],
		define: {
			'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageVersion),
			// Vercel provides this variable during the build. Keep the value in the
			// client bundle so self-hosted Node builds do not load Vercel-only scripts.
			'import.meta.env.VERCEL': JSON.stringify('VERCEL' in process.env)
		}
	};
});
