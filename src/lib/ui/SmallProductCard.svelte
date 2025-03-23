<script lang="ts">
	import type { ProductReduced } from '$lib/api';
	import { navigating } from '$app/state';

	interface Props {
		product: ProductReduced;
	}

	let { product }: Props = $props();

	function capitalizeWords(name: string): string {
		return name.replace(/\b\w/g, char => char.toUpperCase());
	}
</script>

<a
	href={`/products/${product.code}`}
	class="block"
	class:pointer-events-none={navigating.to}
>
	<div class="h-[14rem] w-56 bg-white shadow-md rounded-2xl">
		<div class="h-[10rem] w-full text-center text-sm">
			{#if navigating.to?.params?.barcode === product.code}
				<span class="loading loading-ring loading-lg mx-auto my-auto"></span>
			{:else if product.image_front_small_url}
				<img
					src={product.image_front_small_url ?? ''}
					class="w-full h-full object-cover overflow-hidden rounded-t-2xl"
					alt="Product front"
				/>
			{/if}
		</div>
		<div class="flex flex-col justify-center items-center font-semibold text-black px-2 pt-2">
			<div class="font-bold text-center truncate w-[100%] 2xl:text-[18px]" title={product.product_name ? capitalizeWords(product.product_name) : product.code}>
				{product.product_name ? capitalizeWords(product.product_name) : product.code}
			</div>
			<p class="text-xs">
				{product.brands} - {product.quantity}
			</p>
		</div>
	</div>
</a>
