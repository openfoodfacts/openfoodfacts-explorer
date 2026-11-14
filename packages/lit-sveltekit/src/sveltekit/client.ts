/**
 * Loads Lit's declarative shadow DOM hydration support, then imports the
 * modules that register the custom elements.
 *
 * Call this from a browser-only lifecycle such as Svelte's `onMount`, and
 * import the component bundle through `loadComponents` so hydration support
 * is installed first. Set `options.hydrate` to `false` to skip Lit hydration;
 * the component bundle is still loaded and its elements upgrade in the browser.
 *
 * @param loadComponents Callback that imports the custom-element definitions.
 * @param options.hydrate Whether to hydrate Lit's server-rendered shadow DOM. Defaults to `true`.
 * @returns A promise that resolves when hydration support and the component bundle are loaded.
 */
export async function loadLitComponents(
	loadComponents: () => Promise<unknown>,
	options: { hydrate?: boolean } = {}
): Promise<void> {
	if (options.hydrate !== false) {
		await import('@lit-labs/ssr-client/lit-element-hydrate-support.js');
	}
	await loadComponents();
}
