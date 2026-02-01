<!--
@component
Wraps the <product-card> web component and adds accessibility features.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ProductReduced } from '$lib/api';
	import type { ScoreData } from '$lib/scoring';
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import { _ } from 'svelte-i18n';

	import IconMdiAdd from '@iconify-svelte/mdi/plus';
	import { compareStore } from '$lib/stores/compareStore';
	import { getToastCtx } from '$lib/stores/toasts';

	type Props = {
		product: ProductReduced | Product;
		personalScore?: ScoreData;
	};
	let { product, personalScore }: Props = $props();

	let navigating = $state(false);
	async function navigateToProduct() {
		navigating = true;
		await goto(`/products/${product.code}`);
		navigating = false;
	}

	let showContextMenu = $state(false);
	let pos = $state({ x: 0, y: 0 });
	function contextMenu(event: MouseEvent) {
		// if Alt/Option or Ctrl/Cmd is pressed, let the browser handle it
		if (event.altKey || event.ctrlKey || event.metaKey) {
			return;
		}

		event.preventDefault();
		pos = { x: event.clientX, y: event.clientY };
		showContextMenu = true;
	}

	function closeContextMenu() {
		showContextMenu = false;
		pos = { x: 0, y: 0 };
	}

	function addToComparison() {
		closeContextMenu();
		const ok = compareStore.addProduct(product as ProductReduced);
		if (ok) {
			toastCtx.success(
				$_('product.menu.added_to_comparison', {
					default: 'Product added to comparison'
				})
			);
		} else {
			toastCtx.info(
				$_('product.menu.add_to_comparison_failed', {
					default: 'Product is already in comparison or comparison list is full'
				})
			);
		}
	}

	const toastCtx = getToastCtx();
</script>

<svelte:window
	onmousedown={closeContextMenu}
	onkeydown={(e) => {
		if (e.key === 'Escape') closeContextMenu();
	}}
/>

<product-card
	class="h-44 w-full cursor-pointer"
	{product}
	onclick={navigateToProduct}
	onkeyup={(e: KeyboardEvent) => e.key === 'Enter' && navigateToProduct()}
	aria-label={`Go to product ${product.product_name} with code ${product.code}`}
	showMatchTag={personalScore != undefined}
	navigating={{
		to: navigating ? { params: { barcode: product.code } } : null
	}}
	{personalScore}
	role="button"
	tabindex="0"
	oncontextmenu={contextMenu}
></product-card>

{#if showContextMenu}
	<div
		role="none"
		class="bg-base-100 border-base-300 animate-in fade-in slide-in-from-top-1 fixed z-50 min-w-48 rounded-xl border shadow-2xl backdrop-blur-sm duration-200"
		style="top: {pos.y}px; left: {pos.x}px;"
		onmousedown={(e) => e.stopPropagation()}
	>
		<div class="p-1.5">
			<button
				class="hover:bg-base-200 active:bg-base-300 focus:bg-base-200 focus:ring-primary flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all duration-150 ease-out focus:ring-2 focus:ring-offset-1 focus:outline-none"
				onclick={addToComparison}
			>
				<IconMdiAdd class="h-5 w-5 opacity-70" />
				<span>{$_('product.menu.add_to_comparison', { default: 'Add to comparison' })}</span>
			</button>
		</div>
	</div>
{/if}
