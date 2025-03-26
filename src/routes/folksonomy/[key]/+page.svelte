<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	function productNameOrBarcode(
		product: { product_name: string } | null,
		tag: { product: string }
	) {
		return product?.product_name ?? tag.product;
	}
</script>

<h2 class="text-2xl font-bold">
	Folksonomy tag:
	<span class="bg-accent text-accent-content ml-4 rounded-lg p-2 font-mono text-xl">
		{page.params.key}
	</span>
</h2>

<table class="table-zebra table-sm table">
	<thead>
		<tr>
			<th>Product</th>
			<th>Barcode</th>
			<th>Value</th>
		</tr>
	</thead>
	<tbody>
		{#each data.tags as tag, i (i)}
			<tr>
				<td>
					{#await data.streamed.products}
						Loading product name...
					{:then products}
						<a class="link" href="/products/{tag.product}">
							{productNameOrBarcode(products[i], tag)}
						</a>
					{/await}
				</td>
				<td>
					{tag.product}
				</td>
				<td>
					<input type="text" class="input" readonly value={tag.v} />
				</td>
			</tr>
		{/each}
	</tbody>
</table>
