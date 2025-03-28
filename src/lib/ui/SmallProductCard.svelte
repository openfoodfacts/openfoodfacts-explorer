<script lang="ts">
	import type { ProductReduced } from '$lib/api';
	import { navigating } from '$app/state';
	import { KP_ATTRIBUTE_IMG } from '$lib/const';

	interface Props {
		product: ProductReduced;
	}

	let { product }: Props = $props();

	let nutriscoreSrc = $derived(
		KP_ATTRIBUTE_IMG('nutriscore-' + product.nutriscore_grade + '-new-en.svg')
	);

	let novaSrc = $derived(
		product.nova_group
			? KP_ATTRIBUTE_IMG('nova-group-' + product.nova_group + '.svg')
			: KP_ATTRIBUTE_IMG('nova-group-unknown.svg')
	);

	let ecoscoreSrc = $derived(KP_ATTRIBUTE_IMG('ecoscore-' + product.ecoscore_grade + '.svg'));
</script>

<a
	href={`/products/${product.code}`}
	class="small-product-card flex justify-center sm:m-2 sm:w-64"
	class:pointer-events-none={navigating.to}
>
	<div class="dark:bg-base-200 text-primary flex h-[10rem] w-[20rem] rounded-2xl shadow-md">
		<div class="image-container h-[100%] w-[8rem] text-center text-sm sm:w-28">
			{#if navigating.to?.params?.barcode === product.code}
				<span class="loading loading-ring loading-lg mx-auto my-auto"></span>
			{:else if product.image_front_small_url}
				<img
					src={product.image_front_small_url ?? ''}
					class="h-full w-full overflow-hidden rounded-l-2xl object-cover"
					alt="Product front"
				/>
			{:else}
				<div
					class="flex aspect-square h-full w-full items-center justify-center bg-transparent text-black"
				>
					<img
						src="Placeholder.svg"
						class="h-16 rounded-lg bg-transparent object-cover"
						alt="Product front"
					/>
				</div>
			{/if}
		</div>
		<div
			class="details-container flex w-[12rem] flex-col items-center justify-evenly p-[0.5rem] pl-[0.7rem] font-semibold sm:w-40"
		>
			<div
				class="title w-[100%] truncate text-[1.2rem] font-semibold sm:text-base"
				title={product.product_name ? product.product_name : product.code}
			>
				{product.product_name ? product.product_name : product.code}
			</div>
			<div class="brand-quantity flex w-full justify-start">
				<p
					class="truncate text-xs text-[0.8rem] sm:text-[0.7rem]"
					title="{product.brands} - {product.quantity}"
				>
					{product.brands} - {product.quantity}
				</p>
			</div>
			{#if product.product_type === 'food'}
				<div class="icons mt-2 flex w-full flex-row items-center justify-between gap-2">
					<div><img src={nutriscoreSrc} alt="nutriscore" class="h-[40px] sm:h-8" /></div>
					<div><img src={novaSrc} alt="nova" class="mt-[-10px] h-[44px] sm:h-8" /></div>
					<div><img src={ecoscoreSrc} alt="nova" class="h-[40px] sm:h-8" /></div>
				</div>
			{/if}
		</div>
	</div>
</a>
