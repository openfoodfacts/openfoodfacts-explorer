<script lang="ts">
	import { _ } from '$lib/i18n';

	interface Props {
		barcode: string;
	}

	let { barcode }: Props = $props();

	let encodedBarcode = $derived(barcode ? encodeURIComponent(barcode) : '');
</script>

<div class="my-4 flex flex-wrap gap-2">
	<a
		class="btn btn-outline"
		href={`https://world.openfoodfacts.org/product/${encodedBarcode}`}
		target="_blank"
		rel="noopener noreferrer"
		title={$_('product.external.openfoodfacts_title')}
	>
		{$_('product.external.openfoodfacts')}
	</a>

	<a
		class="btn btn-outline"
		href={`https://www.barcodelookup.com/?query=${encodedBarcode}`}
		target="_blank"
		rel="noopener noreferrer"
		title={$_('product.external.barcode_lookup_title')}
	>
		{$_('product.external.barcode_lookup')}
	</a>

	<a
		class="btn btn-outline"
		href={`https://prices.openfoodfacts.org/products/${encodedBarcode}`}
		target="_blank"
		rel="noopener noreferrer"
		title={$_('product.external.open_prices_title')}
	>
		{$_('product.external.open_prices')}
	</a>
</div>
