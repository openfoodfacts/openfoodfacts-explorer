<script lang="ts">
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import { _ } from '#lib/i18n/index.js';
	import { resolve } from '$app/paths';
	import { PRODUCT_REPORT_URL } from '#lib/const.js';
	import { addItemToCalculator, extractNutriments } from '#lib/stores/calculatorStore.js';
	import { compareStore } from '#lib/stores/compareStore.js';
	import { userInfo } from '#lib/stores/user.js';
	import { getToastCtx } from '#lib/stores/toasts.js';
	import { trackOffEvent } from '#lib/analytics.js';

	import IconMdiDotsHorizontal from '@iconify-svelte/mdi/dots-horizontal';
	import IconMdiOpenInNew from '@iconify-svelte/mdi/open-in-new';
	import IconMdiScaleBalance from '@iconify-svelte/mdi/scale-balance';
	import IconMdiShape from '@iconify-svelte/mdi/shape';
	import IconMdiCalculator from '@iconify-svelte/mdi/calculator';
	import IconMdiFlag from '@iconify-svelte/mdi/flag';

	type Props = {
		product: Product;
		productWebsiteUrl: string;
	};
	let { product, productWebsiteUrl }: Props = $props();

	let toastCtx = getToastCtx();

	let similarHref = $derived.by(() => {
		const value = product.categories_tags?.at(-1);
		return value != null
			? resolve('/facets/[facet]/[value]', { facet: 'categories', value })
			: null;
	});

	let activeElement = $state<Element | null>(null);

	function closeMenu() {
		(activeElement as HTMLElement | null)?.blur();
	}

	function menuOnKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeMenu();
	}

	function addToCalculator() {
		closeMenu();
		// FIXME: product.code cannot be null
		const code = product.code!;

		addItemToCalculator({
			id: code,
			name: product.product_name || code,
			quantity: 100,
			imageUrl: product.image_front_small_url,
			// @ts-expect-error - FIXME: maybe deprecated but the JSON response has this field
			nutriments: extractNutriments(product.nutriments)
		});
	}

	function addToComparison() {
		closeMenu();
		// Convert Product to ProductReduced - using type assertion since the product exists
		const added = compareStore.addProduct(product);
		if (added) {
			toastCtx.success(
				$_('product.menu.added_to_comparison', { default: 'Product added to comparison' })
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

<svelte:document bind:activeElement />

<div class="dropdown dropdown-end" role="presentation" onkeydown={menuOnKeydown}>
	<div
		tabindex="0"
		role="button"
		class="btn rounded-full btn-outline btn-sm"
		aria-label={$_('product.buttons.more')}
	>
		<IconMdiDotsHorizontal class="h-5 w-5" aria-hidden="true" />
	</div>
	<ul
		class="menu dropdown-content z-50 mt-1 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
	>
		<li>
			<a href={productWebsiteUrl} target="_blank" rel="noopener noreferrer" onclick={closeMenu}>
				<IconMdiOpenInNew class="h-5 w-5" aria-hidden="true" />
				{$_('product.buttons.classic_view')}
			</a>
		</li>
		<li>
			<button onclick={addToComparison}>
				<IconMdiScaleBalance class="h-5 w-5" aria-hidden="true" />
				{$_('product.buttons.compare')}
			</button>
		</li>
		{#if similarHref}
			<li>
				<a href={similarHref} onclick={closeMenu}>
					<IconMdiShape class="h-5 w-5" aria-hidden="true" />
					{$_('product.barcode.similar_products')}
				</a>
			</li>
		{/if}
		{#if $userInfo != null}
			<li>
				<button onclick={addToCalculator}>
					<IconMdiCalculator class="h-5 w-5" aria-hidden="true" />
					{$_('product.buttons.add_to_calculator')}
				</button>
			</li>
		{/if}
		<li>
			<a
				id="report-problem"
				href={PRODUCT_REPORT_URL(product.code!, product.product_type)}
				target="_blank"
				rel="noopener noreferrer"
				onclick={() => {
					closeMenu();
					trackOffEvent('feature', 'report_problem_opened', 'product_header');
				}}
			>
				<IconMdiFlag class="h-5 w-5" aria-hidden="true" />
				{$_('product.buttons.report')}
			</a>
		</li>
	</ul>
</div>
