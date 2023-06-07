import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { version as packageVersion } from './package.json';

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageVersion)
	}
});
