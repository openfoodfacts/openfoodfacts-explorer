export async function loadLitComponents(
	loadComponents: () => Promise<unknown>,
	options: { hydrate?: boolean } = {}
): Promise<void> {
	if (options.hydrate !== false) {
		await import('@lit-labs/ssr-client/lit-element-hydrate-support.js');
	}
	await loadComponents();
}
