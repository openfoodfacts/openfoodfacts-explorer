<!--
@component
Wraps the <product-card> web component and adds accessibility features.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ProductReduced } from '$lib/api';
	import type { ScoreData } from '$lib/scoring';
	import { OpenFoodFacts, type Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import { stripTaxonomyPrefix } from '$lib/api';
	import { _ } from 'svelte-i18n';

	import IconMdiAdd from '@iconify-svelte/mdi/plus';
	import { compareStore } from '$lib/stores/compareStore';
	import { getToastCtx } from '$lib/stores/toasts';

	type Props = {
		product: ProductReduced | Product;
		personalScore?: ScoreData;
	};
	let { product, personalScore }: Props = $props();

	let sanitizedProduct = $derived.by(() => {
		const p = product as Product;
		return {
			...product,
			brands: p.brands
				?.split(',')
				.map((b: string) => stripTaxonomyPrefix(b.trim()))
				.join(', '),
			...(p.brands_tags && {
				brands_tags: Array.isArray(p.brands_tags)
					? p.brands_tags.map(stripTaxonomyPrefix)
					: p.brands_tags
			})
		};
	});

	let navigating = $state(false);
	async function navigateToProduct() {
		navigating = true;
		await goto(`/products/${product.code}`);
		navigating = false;
	}

	let showContextMenu = $state(false);
	let pos = $state({ x: 0, y: 0 });
	let contextFocusIndex = $state(0);

	function contextMenu(event: MouseEvent) {
		// if Alt/Option or Ctrl/Cmd is pressed, let the browser handle it
		if (event.altKey || event.ctrlKey || event.metaKey) {
			return;
		}

		event.preventDefault();
		pos = { x: event.clientX, y: event.clientY };
		showContextMenu = true;
		contextFocusIndex = 0;
	}

	function closeContextMenu() {
		showContextMenu = false;
		pos = { x: 0, y: 0 };
	}

	const contextItems = [
		{
			id: 'add-to-comparison',
			label: $_('product.menu.add_to_comparison', { default: 'Add to comparison' }),
			icon: IconMdiAdd,
			action: addToComparison
		}
	];

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			contextFocusIndex = (contextFocusIndex + 1) % contextItems.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			contextFocusIndex = (contextFocusIndex - 1 + contextItems.length) % contextItems.length;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			contextItems[contextFocusIndex].action();
		} else if (event.key === 'Escape') {
			closeContextMenu();
		}
	}

	const toastCtx = getToastCtx();

	async function addToComparison() {
		closeContextMenu();

		// @ts-expect-error - Product should not have { [key: string]: string },
		// because that means it ONLY has string values
		const fullProduct: Product = await new OpenFoodFacts(fetch).getProductV3(product.code);

		const ok = compareStore.addProduct(fullProduct);
		if (ok) {
			toastCtx.success(
				$_('product.menu.added_to_comparison', {
					default: 'Product added to comparison'
				})
			);
		} else {
			toastCtx.warning(
				$_('product.menu.add_to_comparison_failed', {
					default: 'Product is already in comparison or comparison list is full'
				})
			);
		}
	}
</script>

<svelte:window
	onmousedown={closeContextMenu}
	onkeydown={(e) => {
		if (e.key === 'Escape') closeContextMenu();
	}}
/>

<product-card
	class="h-44 w-full cursor-pointer"
	product={sanitizedProduct}
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
		role="menu"
		tabindex="-1"
		class="bg-base-100 border-base-300 animate-in fade-in slide-in-from-top-1 fixed z-50 min-w-48 rounded-xl border shadow-2xl backdrop-blur-sm duration-200"
		style="top: {pos.y}px; left: {pos.x}px;"
		onmousedown={(e) => e.stopPropagation()}
		onkeydown={handleKeyDown}
	>
		<div class="p-1.5">
			{#each contextItems as item (item.id)}
				<button
					role="menuitem"
					class="hover:bg-base-200 active:bg-base-300 focus:bg-base-200 focus:ring-primary flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all duration-150 ease-out focus:ring-2 focus:ring-offset-1 focus:outline-none"
					onclick={item.action}
				>
					<item.icon class="h-5 w-5 opacity-70" />
					<span>{item.label}</span>
				</button>
			{/each}
		</div>
	</div>
{/if}
