<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getCommandCtx } from '$lib/stores/commandPalette';
	import { copyTextToClipboard } from '$lib/utils/clipboard';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const commandCtx = getCommandCtx();

	$effect(() => {
		const code = page.params.barcode;
		if (!code) return;

		const sourceId = `product-${code}`;

		commandCtx.register(sourceId, [
			{
				id: 'product-edit',
				title: 'Edit product',
				description: 'Open the product editor',
				category: 'Product',
				contextual: true,
				priority: 100,
				action: () => goto(resolve('/products/[barcode]/edit', { barcode: code }))
			},
			{
				id: 'product-copy-barcode',
				title: 'Copy barcode',
				description: `Copy ${code} to clipboard`,
				category: 'Product',
				contextual: true,
				action: async () => {
					await copyTextToClipboard(code);
				}
			},
			{
				id: 'product-share',
				title: 'Share product',
				description: 'Share product link or copy URL',
				category: 'Product',
				contextual: true,
				action: async () => {
					if (navigator.share) {
						try {
							await navigator.share({ title: document.title, url: window.location.href });
							return;
						} catch (error) {
							if (error instanceof Error && error.name === 'AbortError') return;
						}
					}

					await copyTextToClipboard(window.location.href);
				}
			}
		]);

		return () => commandCtx.unregister(sourceId);
	});
</script>

{@render children()}
