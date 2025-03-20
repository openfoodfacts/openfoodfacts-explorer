<script lang="ts">
	import type { ProductReduced } from '$lib/api';
	import { navigating } from '$app/state';

	interface Props {
		product: ProductReduced;
	}

	let { product }: Props = $props();
</script>

<a
	href={`/products/${product.code}`}
	class="btn btn-ghost text-primary dark:bg-base-300 pointer-events-none m-auto flex h-60 w-56 flex-col items-center justify-normal space-y-2 rounded-2xl bg-white p-4 text-center shadow-md"
	class:pointer-events-none={navigating.to}
>
	<!-- Image Section -->
	<div class="flex h-24 w-24 items-center justify-center overflow-hidden">
		{#if navigating.to?.params?.barcode === product.code}
			<span class="loading loading-ring loading-lg mx-auto my-auto"></span>
		{/if}
		{#if product.image_front_small_url != null}
			<img
				src={product.image_front_small_url}
				alt={product.product_name}
				class="h-full w-full object-contain"
			/>
		{:else}
			<div
				class="placeholder flex aspect-square h-full w-full items-center justify-center bg-amber-50 text-black"
			>
				No Image
			</div>
		{/if}
	</div>

	<div class="m-auto flex w-full flex-col items-center">
		<p class="line-clamp-2 w-full text-center text-lg">
			{product.product_name ?? product.code}
		</p>
		<p class="mt-1 line-clamp-2 w-full text-center text-sm font-light">
			{product.brands} - {product.quantity}
		</p>
	</div>
</a>
