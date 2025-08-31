<!--
@component
Wraps the <product-card> web component and adds accessibility features.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ScoreData } from '$lib/scoring';
	import type { Product, ProductReduced } from '@openfoodfacts/openfoodfacts-nodejs';

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
</script>

<product-card
	class="h-[11rem] w-full cursor-pointer"
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
></product-card>
