<script lang="ts">
	import type { ProductReduced } from '$lib/api';
	import { navigating } from '$app/stores';

	interface Props {
		product: ProductReduced;
	}

	let { product }: Props = $props();
</script>

<a
	href={`/products/${product.code}`}
	class="btn btn-ghost pointer-events-none h-auto justify-normal bg-white p-4 text-start text-primary shadow-md dark:bg-base-300"
	class:pointer-events-none={$navigating}
>
	<div class="flex flex-row items-center">
		<div class="mr-4 flex w-16 shrink-0 items-center justify-center">
			{#if $navigating?.to?.params?.barcode === product.code}
				<span class="loading loading-ring loading-lg mx-auto my-auto"></span>
			{:else if product.image_front_small_url}
				<img
					src={product.image_front_small_url}
					class="h-16 rounded-lg object-cover"
					alt="Product front"
				/>
			{/if}
		</div>
		<div>
			<p class="text-lg">
				{product.product_name ?? product.code}
			</p>
			<p class="mt-2 text-sm font-light">
				{product.brands} - {product.quantity}
			</p>
		</div>
	</div>
</a>
