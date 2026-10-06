import vercelAdapter from '@sveltejs/adapter-vercel';
import nodejsAdapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { execFileSync } from 'node:child_process';
import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import packageJson from './package.json' with { type: 'json' };
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from '@tailwindcss/vite';

const packageVersion = packageJson.version;

// Docker builds receive GIT_COMMIT_SHA as a build arg, since .git is excluded from the build context
function resolveBuildCommitSha(): string {
	const fromEnv = process.env.GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA;
	if (fromEnv) return fromEnv;
	try {
		return (
			execFileSync('git', ['rev-parse', 'HEAD'], { stdio: ['ignore', 'pipe', 'ignore'] })
				.toString()
				.trim() || 'unknown'
		);
	} catch {
		return 'unknown';
	}
}

function runningOnVercel() {
	return 'VERCEL' in process.env;
}

const adapter = runningOnVercel() ? vercelAdapter() : nodejsAdapter();
const vercelScripts = runningOnVercel()
	? (['https://va.vercel-scripts.com/'] as const)
	: ([] as const);

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
		tailwindcss(),
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'openfoodfacts',
				project: 'openfoodfacts-explorer'
			}
		}),

		sveltekit({
			// Consult https://kit.svelte.dev/docs/integrations#preprocessors
			// for more information about preprocessors
			preprocess: vitePreprocess(),
			adapter,
			csp: {
				directives: {
					'object-src': ['none'],
					'base-uri': ['self'],
					'script-src': [
						'self',
						'unsafe-eval' /* Required for Vega charts */,
						...vercelScripts,
						'https://analytics.openfoodfacts.org'
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
						'https://upload.wikimedia.org',
						'https://lheuredescomptes.org'
					],
					'style-src': ['self', 'unsafe-inline'],
					'frame-ancestors': ['none']
				}
			},
			experimental: {},
			tracing: { server: true }
		}),

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
		'import.meta.env.BUILD_COMMIT_SHA': JSON.stringify(resolveBuildCommitSha()),
		// Vercel provides this variable during the build. Keep the value in the
		// client bundle so self-hosted Node builds do not load Vercel-only scripts.
		'import.meta.env.VERCEL': JSON.stringify('VERCEL' in process.env)
	}
});
