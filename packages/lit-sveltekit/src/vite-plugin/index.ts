import { resolve } from 'node:path';
import { generateLitSvelteComponents, type LitSvelteWrapperSource } from './generateComponents.ts';
import type { Plugin } from 'vite';

export type { LitSvelteWrapperSource } from './generateComponents.js';

const virtualModuleName = 'virtual:lit-svelte/components';
const resolvedVirtualModuleName = `\0${virtualModuleName}`;
const outputDirectory = '.svelte-kit/generated/lit-svelte';

/**
 * Creates a Vite plugin that generates Svelte wrappers for custom elements in
 * one or more Custom Elements Manifests.
 *
 * Resolve each `manifestPath` relative to the Vite project root. The plugin
 * writes generated wrappers under `.svelte-kit/generated/lit-svelte/` and
 * exposes them as named exports from `virtual:lit-svelte/components`. Add the
 * plugin to the Vite configuration before `sveltekit()`.
 *
 * @param sources Manifest paths and optional prefixes for generated component names.
 * @returns A Vite plugin that generates and serves the wrappers.
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
