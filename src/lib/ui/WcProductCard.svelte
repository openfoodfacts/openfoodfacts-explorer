<!--
@component
Wraps the <product-card> web component and adds accessibility features.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

	let { product }: { product: Product } = $props();
</script>

<product-card
	class="cursor-pointer w-full h-full"
	{product}
	onclick={() => goto(`/products/${product.code}`)}
	onkeyup={(e: KeyboardEvent) => e.key === 'Enter' && goto(`/products/${product.code}`)}
	aria-label={`Go to product ${product.product_name} with code ${product.code}`}
	role="button"
	tabindex="0"
></product-card>
