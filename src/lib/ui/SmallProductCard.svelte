<script lang="ts">
	import type { ProductReduced } from '$lib/api';
	import { navigating } from '$app/state';
	import { KP_ATTRIBUTE_IMG } from '$lib/const';

	interface Props {
		product: ProductReduced;
	}

	let { product }: Props = $props();

	function capitalizeWords(name: string): string {
		return name.replace(/\b\w/g, (char) => char.toUpperCase());
	}

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

<a href={`/products/${product.code}`} class="block" class:pointer-events-none={navigating.to}>
	<div class="dark:bg-base-200 text-primary h-[14.5rem] w-[16rem] rounded-2xl shadow-md">
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
			{#if product.product_type === 'food'}
				<div class="mt-2 flex flex-row items-center justify-between gap-2">
					<div><img src={nutriscoreSrc} alt="nutriscore" class="h-8" /></div>
					<div><img src={novaSrc} alt="nova" class="h-8" /></div>
					<div><img src={ecoscoreSrc} alt="nova" class="h-8" /></div>
				</div>
			{/if}
		</div>
	</div>
</a>
