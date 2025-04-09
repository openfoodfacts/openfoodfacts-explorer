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
	class="flex w-full justify-center"
	class:pointer-events-none={navigating.to}
>
	<div class="dark:bg-base-200 text-primary flex h-40 w-full max-w-full lg:max-w-xl rounded-2xl shadow-md">
		<div class="h-full w-32 text-center text-sm sm:w-28 lg:w-36">
			{#if navigating.to?.params?.barcode === product.code}
				<div class="flex h-full w-full items-center justify-center">
					<span class="loading loading-ring loading-lg"></span>
				</div>
			{:else if product.image_front_small_url}
				<img
					src={product.image_front_small_url}
					class="h-full w-full overflow-hidden rounded-l-2xl object-cover"
					alt="Product front"
				/>
			{:else}
				<div
					class="flex aspect-square h-full w-full items-center justify-center bg-transparent text-black"
				>
					<img
						src="/Placeholder.svg"
						class="h-16 rounded-lg bg-transparent object-cover"
						alt="Product front"
					/>
				</div>
			{/if}
		</div>
		<div class="flex w-60 flex-col items-center justify-evenly p-2 pl-3 font-semibold sm:w-40 md:w-56 lg:w-52">
			<div
				class="title w-full truncate text-lg font-semibold sm:text-base"
				title={product.product_name ? product.product_name : product.code}
			>
				{product.product_name ? product.product_name : product.code}
			</div>
			<div class="brand-quantity flex w-full justify-start">
				<p class="truncate text-sm" title="{product.brands} - {product.quantity}">
					{product.brands} - {product.quantity}
				</p>
			</div>
			{#if product.product_type === 'food'}
				<div class="mt-2 flex w-full flex-row items-stretch justify-between gap-1 h-12">
					<div class="flex items-center"><img src={nutriscoreSrc} alt="nutriscore" class="h-full max-h-10 sm:max-h-10" /></div>
					<div class="flex items-center"><img src={novaSrc} alt="nova" class="h-full max-h-11 sm:max-h-10" /></div>
					<div class="flex items-center"><img src={ecoscoreSrc} alt="ecoscore" class="h-full max-h-10 sm:max-h-10" /></div>
				</div>
			{/if}
		</div>
	</div>
</a>
