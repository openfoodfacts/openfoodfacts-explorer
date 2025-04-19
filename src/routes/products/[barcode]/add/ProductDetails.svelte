<script lang="ts">
	import Card from '$lib/ui/Card.svelte';
	import type { Product } from '$lib/api';

	interface Props {
		data: Product;
	}

	const { data }: Props = $props();

	const product = $state({
		product_name: data.product_name || '',
		quantity: data.quantity || '',
		brands: data.brands || '',
		categories: data.categories || '',
		labels: data.labels || '',
		stores: data.stores || '',
		origins: data.origins || '',
		countries: data.countries || ''
	});

	$effect(() => {
		data.product_name = product.product_name;
		data.quantity = product.quantity;
		data.brands = product.brands;
		data.categories = product.categories;
		data.labels = product.labels;
		data.stores = product.stores;
		data.origins = product.origins;
		data.countries = product.countries;
	});
</script>

<Card>
	<h3 class="mb-4 text-3xl font-semibold">Product characteristics</h3>
	<div class="mb-4 flex items-center gap-2">
		Barcode: {data.code}
	</div>
	<div class="form-control mb-4">
		<label for="product_name">Product Name</label>
		<input
			id="product_name"
			type="text"
			class="input input-bordered w-full"
			bind:value={product.product_name}
			placeholder="Enter product name"
		/>
	</div>
	<div class="form-control mb-4">
		<label for="quantity">Quantity</label>
		<input
			id="quantity"
			type="text"
			class="input input-bordered w-full"
			bind:value={product.quantity}
			placeholder="Enter quantity (e.g., 500g)"
		/>
	</div>

	<div class="form-control mb-4">
		<label for="brands">Brands</label>
		<input
			id="brands"
			type="text"
			class="input input-bordered w-full"
			bind:value={product.brands}
			placeholder="Enter brands (comma-separated)"
		/>
	</div>

	<div class="form-control mb-4">
		<label for="categories">Categories</label>
		<input
			id="categories"
			type="text"
			class="input input-bordered w-full"
			bind:value={product.categories}
			placeholder="Enter categories (comma-separated)"
		/>
	</div>

	<div class="form-control mb-4">
		<label for="labels">Labels, certifications, awards</label>
		<input
			id="labels"
			type="text"
			class="input input-bordered w-full"
			bind:value={product.labels}
			placeholder="Enter labels, certifications, awards (comma-separated)"
		/>
	</div>

	<div class="form-control mb-4">
		<label for="stores">Stores</label>
		<input
			id="stores"
			type="text"
			class="input input-bordered w-full"
			bind:value={product.stores}
			placeholder="Enter stores (comma-separated)"
		/>
	</div>

	<div class="form-control mb-4">
		<label for="origins">Origins</label>
		<input
			id="origins"
			type="text"
			class="input input-bordered w-full"
			bind:value={product.origins}
			placeholder="Enter origins (comma-separated)"
		/>
	</div>

	<div class="form-control mb-4">
		<label for="countries">Countries</label>
		<input
			id="countries"
			type="text"
			class="input input-bordered w-full"
			bind:value={product.countries}
			placeholder="Enter countries (comma-separated)"
		/>
	</div>
</Card>
