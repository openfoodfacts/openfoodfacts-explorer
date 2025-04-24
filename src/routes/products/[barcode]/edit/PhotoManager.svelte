<script lang="ts">
	import { writable, get } from 'svelte/store';
	import ISO6391 from 'iso-639-1';
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';
	import { getProductImageUrl } from '$lib/api/product';

	interface Props {
		product: ReturnType<typeof writable<Product>>;
	}

	let { product }: Props = $props();

	function getLanguage(code: string) {
		return ISO6391.getName(code);
	}

	const photoTypes = [
		{ id: 'front', label: 'Front' },
		{ id: 'ingredients', label: 'Ingredients' },
		{ id: 'nutrition', label: 'Nutrition' },
		{ id: 'packaging', label: 'Packaging' }
	];

	type ProductImage = {
		url: string;
		alt: string;
		type: string;
	};

	function getAllImages(code: string): ProductImage[] {
		const standardImages = photoTypes
			.map((photoType) => {
				const imageName = `${photoType.id}_${code}`;
				const imageUrl = getProductImageUrl($product.code, imageName, get(product));
				return imageUrl
					? {
							url: imageUrl,
							alt: `${photoType.label} image for ${getLanguage(code)}`,
							type: photoType.label
						}
					: null;
			})
			.filter((img): img is ProductImage => img !== null);

		const productImages = get(product).images;
		const additionalImages = Object.keys(productImages)
			.filter(
				(key) => key.endsWith(`_${code}`) && !photoTypes.some((pt) => key === `${pt.id}_${code}`)
			)
			.map((key) => {
				const imageUrl = getProductImageUrl($product.code, key, get(product));
				return imageUrl
					? {
							url: imageUrl,
							alt: `${key} for ${getLanguage(code)}`,
							type: key.split('_')[0]
						}
					: null;
			})
			.filter((img): img is ProductImage => img !== null);

		return [...standardImages, ...additionalImages];
	}
</script>

<div class="mb-6">
	<h3 class="mb-4 text-xl font-bold">{$_('product.edit.photos')}</h3>

	<div class="tabs tabs-box">
		{#each Object.keys($product.languages_codes) as code (code)}
			<input
				type="radio"
				name="photo_tabs"
				class="tab"
				aria-label={getLanguage(code)}
				defaultChecked={code === $product.lang}
			/>
			<div class="tab-content p-6">
				<h4 class="text-md mb-3 font-semibold">
					{photoTypes[0].label} picture ({getLanguage(code)})
				</h4>

				<div class="flex flex-wrap gap-3">
					{#each getAllImages(code) as image (image.url)}
						<div class="h-40 w-40 overflow-hidden border">
							<img src={image.url} alt={image.alt} class="h-full w-full object-contain" />
						</div>
					{/each}

					{#if getAllImages(code).length === 0}
						<div class="bg-base-200 flex w-full items-center justify-center p-4">
							<p class="text-base-content/60 text-sm">{$_('product.edit.no_photo_available')}</p>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
