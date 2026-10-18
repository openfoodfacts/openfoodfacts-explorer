import { resolve } from 'node:path';
import { generateLitSvelteComponents, type LitSvelteWrapperSource } from './generateComponents.ts';
import type { Plugin } from 'vite';

export type { LitSvelteWrapperSource } from './generateComponents.js';

const virtualModuleName = 'virtual:lit-svelte/components';
const resolvedVirtualModuleName = `\0${virtualModuleName}`;
const outputDirectory = '.svelte-kit/generated/lit-svelte';

/**
 * Reads a Custom Elements Manifest, generates Svelte adapters outside src,
 * and exposes them as named exports from a virtual module.
 */
export function litSvelteWrapperPlugin(sources: readonly LitSvelteWrapperSource[]): Plugin {
	let projectRoot = process.cwd();
	let manifestFilePaths = sources.map((source) => resolve(projectRoot, source.manifestPath));
	let componentsPromise: ReturnType<typeof generateLitSvelteComponents> | undefined;

	function generateComponents() {
		if (!componentsPromise) {
			componentsPromise = generateLitSvelteComponents(projectRoot, sources).catch(
				(error: unknown) => {
					componentsPromise = undefined;
					throw error;
				}
			);
		}
		return componentsPromise;
	}

	return {
		name: 'lit-svelte-wrapper',
		async configResolved(config) {
			projectRoot = config.root;
			manifestFilePaths = sources.map((source) => resolve(projectRoot, source.manifestPath));
			await generateComponents();
		},
		resolveId(id) {
			if (id === virtualModuleName) return resolvedVirtualModuleName;
		},
		async load(id) {
			if (id !== resolvedVirtualModuleName) return;

			const components = await generateComponents();
			const generatedDirectory = resolve(projectRoot, outputDirectory);
			return [...components]
				.sort((left, right) => left.componentName.localeCompare(right.componentName))
				.map(
					({ componentName, fileName }) =>
						`export { default as ${componentName} } from ${JSON.stringify(
							resolve(generatedDirectory, fileName).replaceAll('\\', '/')
						)};`
				)
				.join('\n');
		},
		async buildStart() {
			for (const manifestFilePath of manifestFilePaths) this.addWatchFile(manifestFilePath);
			await generateComponents();
		},
		async handleHotUpdate({ file, server }) {
			if (!manifestFilePaths.includes(resolve(file))) return;
			componentsPromise = undefined;
			await generateComponents();
			server.ws.send({ type: 'full-reload' });
			return [];
		}
	};
}
