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
	class="btn btn-ghost text-primary dark:bg-base-300 pointer-events-none h-[133.6px] justify-normal rounded-2xl bg-white p-4 text-start shadow-md"
	class:pointer-events-none={$navigating}
>
	<div class="flex flex-row items-center overflow-hidden">
		<div class="mr-4 flex w-16 shrink-0 items-center justify-center">
			{#if $navigating?.to?.params?.barcode === product.code}
				<span class="loading loading-ring loading-lg mx-auto my-auto"></span>
			{:else if product.image_front_small_url}
				<img
					src={product.image_front_small_url}
					class="h-16 rounded-lg object-cover"
					alt="Product front"
				/>
			{:else}
				<div
					class="placeholder flex aspect-square h-full w-full items-center justify-center bg-amber-50 text-black"
				>
					No Image
				</div>
			{/if}
		</div>
		<div class="m-auto flex w-full flex-col items-center overflow-hidden text-ellipsis">
			<p class="line-clamp-2 w-full overflow-hidden text-lg text-ellipsis">
				{product.product_name ?? product.code}
			</p>
			<p
				class="mt-1 line-clamp-2 w-full overflow-hidden text-sm font-light text-ellipsis"
			>
				{product.brands} - {product.quantity}
			</p>
		</div>
	</div>
</a>
