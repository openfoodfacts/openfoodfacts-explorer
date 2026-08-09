<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';
	import { PRODUCT_TYPES, type ProductType } from '$lib/const';
	import IconMdiShape from '@iconify-svelte/mdi/shape';
	import addFood from '$lib/assets/add_food.svg';
	import addBeauty from '$lib/assets/add_beauty.svg';
	import addPetFood from '$lib/assets/add_pet_food.svg';
	import addProducts from '$lib/assets/add_products.svg';

	type Props = {
		product: Product;
	};

	let { product = $bindable() }: Props = $props();

	const TYPE_IMAGES: Record<ProductType, string> = {
		food: addFood,
		beauty: addBeauty,
		petfood: addPetFood,
		product: addProducts
	};
</script>

<div class="space-y-6">
	<h2
		class="mb-6 flex items-center justify-center gap-2 text-center text-base font-bold text-primary md:text-lg lg:text-xl xl:text-2xl"
	>
		<IconMdiShape class="h-6 w-6" />
		{$_('product.edit.sections.product_type_step', { default: 'Product Type' })}
		<span class="badge text-xs badge-sm font-semibold text-error-content badge-error sm:badge-md">
			{$_('product.edit.mandatory_badge', { default: 'Mandatory' })}
		</span>
	</h2>

	<div class="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center shadow-sm">
		<p class="text-sm text-base-content/80 sm:text-base">
			{$_('product.edit.product_type_description', {
				default:
					'Select the category that best describes this product. This configures the target database and relevant attributes.'
			})}
		</p>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each PRODUCT_TYPES as type (type)}
			{@const isSelected = product.product_type === type}
			<button
				type="button"
				class="card flex min-h-[180px] cursor-pointer flex-col items-center justify-between border p-6 text-center transition-all duration-200 hover:border-primary/50 hover:shadow-md {isSelected
					? 'border-2 border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
					: 'border-base-300 bg-base-100'}"
				onclick={() => {
					product = { ...product, product_type: type };
				}}
			>
				<div class="flex w-full flex-col items-center gap-4">
					<div class="flex h-20 w-full items-center justify-center p-1">
						<img
							src={TYPE_IMAGES[type]}
							alt={$_(`product.edit.product_types.${type}`)}
							class="h-16 w-16 object-contain transition-transform duration-200"
						/>
					</div>

					<h3 class="text-base font-bold sm:text-lg">
						{$_(`product.edit.product_types.${type}`)}
					</h3>
				</div>
			</button>
		{/each}
	</div>
</div>
