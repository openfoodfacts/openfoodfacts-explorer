import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { version as packageVersion } from './package.json';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
	plugins: [
		sveltekit(),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/@openfoodfacts/openfoodfacts-webcomponents/dist/assets/**/*',
					dest: 'assets'
				}
			]
		})
	],
	define: {
		'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageVersion)
	}
});
