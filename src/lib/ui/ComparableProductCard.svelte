<script lang="ts">
	import type { ProductReduced } from '#lib/api.js';
	import type { ScoreData } from '#lib/scoring.js';
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import { getToastCtx } from '#lib/stores/toasts.js';
	import { _ } from 'svelte-i18n';
	import IconMdiScaleBalance from '@iconify-svelte/mdi/scale-balance';
	import WcProductCard from './WcProductCard.svelte';
	import { addProductToComparison } from './productComparison.js';

	let { product, personalScore }: { product: ProductReduced | Product; personalScore?: ScoreData } =
		$props();
	const toastCtx = getToastCtx();
	let addingToComparison = $state(false);

	async function addToComparison() {
		if (addingToComparison) return;
		addingToComparison = true;
		try {
			await addProductToComparison(product.code, toastCtx);
		} finally {
			addingToComparison = false;
		}
	}
</script>

<div class="flex min-w-0 flex-col rounded-2xl border border-base-300 bg-base-200">
	<WcProductCard {product} {personalScore} />
	<button
		type="button"
		class="btn min-h-11 gap-2 rounded-t-none rounded-b-2xl border-0 border-t border-base-300 btn-ghost btn-sm"
		onclick={addToComparison}
		disabled={addingToComparison}
		aria-busy={addingToComparison}
	>
		<IconMdiScaleBalance class="h-4 w-4" aria-hidden="true" />
		<span>{$_('product.buttons.compare', { default: 'Add to compare' })}</span>
	</button>
</div>
