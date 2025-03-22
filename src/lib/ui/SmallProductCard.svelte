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
	class="btn btn-ghost text-primary dark:bg-base-300 pointer-events-none flex h-auto flex-col justify-normal rounded-2xl bg-white p-4 text-start shadow-md"
	class:pointer-events-none={navigating.to}
>
	<div class="flex flex-row items-center">
		<div class="mr-4 flex w-16 shrink-0 items-center justify-center">
			{#if navigating.to?.params?.barcode === product.code}
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
		<div>
			<p class="text-lg">
				{product.product_name ?? product.code}
			</p>
			<p class="mt-2 text-sm font-light">
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
