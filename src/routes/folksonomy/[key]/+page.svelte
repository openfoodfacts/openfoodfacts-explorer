<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h2 class="text-2xl font-bold">
	Folksonomy tag:
	<span class="ml-4 font-mono bg-accent text-xl text-accent-content p-2 rounded-lg">
		{$page.params.key}
	</span>
</h2>

<table class="table table-zebra table-sm">
	<thead>
		<tr>
			<th>Product</th>
			<th>Barcode</th>
			<th>Value</th>
		</tr>
	</thead>
	<tbody>
		{#each data.tags as tag, i}
			<tr>
				<td>
					{#await data.streamed.products}
						Loading product names...
					{:then products}
						<a class="link" href="/products/{tag.product}">
							{products[i].product_name}
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
