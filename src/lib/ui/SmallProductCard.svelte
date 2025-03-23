<script lang="ts">
	import type { ProductReduced } from '$lib/api';
	import { navigating } from '$app/state';

	interface Props {
		product: ProductReduced;
	}

	let { product }: Props = $props();

	function capitalizeWords(name: string): string {
		return name.replace(/\b\w/g, (char) => char.toUpperCase());
	}
</script>

<a href={`/products/${product.code}`} class="block" class:pointer-events-none={navigating.to}>
	<div class="dark:bg-base-200 text-primary h-[11.5rem] w-[16rem] rounded-2xl shadow-md">
		<div class="h-[8rem] w-full text-center text-sm">
			{#if navigating.to?.params?.barcode === product.code}
				<span class="loading loading-ring loading-lg mx-auto my-auto"></span>
			{:else if product.image_front_small_url}
				<img
					src={product.image_front_small_url ?? ''}
					class="h-full w-full overflow-hidden rounded-t-2xl object-cover"
					alt="Product front"
				/>
			{/if}
		</div>
		<div class="flex flex-col items-center justify-center px-2 pt-2 font-semibold">
			<div
				class="w-[100%] truncate text-center font-semibold 2xl:text-[16px]"
				title={product.product_name ? capitalizeWords(product.product_name) : product.code}
			>
				{product.product_name ? capitalizeWords(product.product_name) : product.code}
			</div>
			<p class="text-xs">
				{product.brands} - {product.quantity}
			</p>
		</div>
	</div>
</a>
