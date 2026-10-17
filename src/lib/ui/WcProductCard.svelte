<!--
@component
Wraps the <product-card> web component and adds accessibility features.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ProductReduced } from '#lib/api.js';
	import type { ScoreData } from '#lib/scoring.js';
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import { _ } from 'svelte-i18n';

	import IconMdiAdd from '@iconify-svelte/mdi/plus';
	import IconMdiEdit from '@iconify-svelte/mdi/pencil';

	import { addProductToComparison } from './productComparison.js';
	import { getToastCtx } from '#lib/stores/toasts.js';
	import { resolve } from '$app/paths';

	type Props = {
		product: ProductReduced | Product;
		personalScore?: ScoreData;
	};
	let { product, personalScore }: Props = $props();

	function normalizeBrands(value: unknown): string {
		if (Array.isArray(value)) {
			return value
				.filter((brand): brand is string => typeof brand === 'string')
				.map((brand) => brand.replace(/^[a-z]{2}:/i, ''))
				.join(', ');
		}

		return typeof value === 'string' ? value : '';
	}

	const productForCard = $derived.by(() => {
		const rawProduct = product as Product & {
			brands?: unknown;
			environmental_score_grade?: string;
			greenscore_grade?: string;
		};
		const greenScoreGrade =
			rawProduct.greenscore_grade ??
			rawProduct.ecoscore_grade ??
			rawProduct.environmental_score_grade;

		return {
			...product,
			brands: normalizeBrands(rawProduct.brands),
			...(greenScoreGrade != null && { greenscore_grade: greenScoreGrade })
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
			id: 'edit',
			label: $_('product.menu.edit', { default: 'Edit product' }),
			icon: IconMdiEdit,
			action: () => {
				goto(resolve('/products/[barcode]/edit', { barcode: product.code }));
			}
		},
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
	let addingToComparison = $state(false);

	async function addToComparison() {
		closeContextMenu();
		if (addingToComparison) return;
		addingToComparison = true;

		try {
			await addProductToComparison(product.code, toastCtx);
		} finally {
			addingToComparison = false;
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
	class="block h-44 w-full cursor-pointer [&:not(:defined)]:skeleton"
	product={productForCard}
	onclick={navigateToProduct}
	onkeyup={(e: KeyboardEvent) => e.key === 'Enter' && navigateToProduct()}
	aria-label={productForCard.product_name
		? $_('product.card.aria_label', {
				values: { productName: productForCard.product_name, productCode: productForCard.code },
				default: 'Go to product {productName} with code {productCode}'
			})
		: $_('product.card.aria_label_no_name', {
				values: { productCode: productForCard.code },
				default: 'Go to product with code {productCode}'
			})}
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
		class="animate-in fade-in slide-in-from-top-1 fixed z-50 min-w-48 rounded-xl border border-base-300 bg-base-100 shadow-2xl backdrop-blur-sm duration-200"
		style="top: {pos.y}px; left: {pos.x}px;"
		onmousedown={(e) => e.stopPropagation()}
		onkeydown={handleKeyDown}
	>
		<div class="p-1.5">
			{#each contextItems as item (item.id)}
				<button
					role="menuitem"
					class="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all duration-150 ease-out hover:bg-base-200 focus:bg-base-200 focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none active:bg-base-300"
					onclick={item.action}
				>
					<item.icon class="h-5 w-5 opacity-70" />
					<span>{item.label}</span>
				</button>
			{/each}
		</div>
	</div>
{/if}
