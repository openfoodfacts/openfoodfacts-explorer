<script lang="ts">
	import { writable, get } from 'svelte/store';
	import ISO6391 from 'iso-639-1';
	import { _ } from '$lib/i18n';
	import { PRODUCT_IMAGE_URL } from '$lib/const';
	import type { SelectedImage, Product } from '$lib/api';

	interface Props {
		product: ReturnType<typeof writable<Product>>;
	}

	let { product }: Props = $props();

	function getLanguage(code: string) {
		return ISO6391.getName(code);
	}

	function getImageUrl(barcode: string, imageName: string): string {
		const paddedBarcode = barcode.toString().padStart(13, '0');
		const match = paddedBarcode.match(/^(.{3})(.{3})(.{3})(.*)$/);
		if (!match) {
			throw new Error('Invalid barcode format');
		}
		const path = `${match[1]}/${match[2]}/${match[3]}/${match[4]}`;
		const image = get(product).images[imageName];
		if (!image) {
			return '';
		}
		const rev = (image as SelectedImage).rev;
		const filename = `${imageName}.${rev}.400.jpg`;
		return PRODUCT_IMAGE_URL(`${path}/${filename}`);
	}

	const photoTypes = [
		{ id: 'front', label: 'Front' },
		{ id: 'ingredients', label: 'Ingredients' },
		{ id: 'nutrition', label: 'Nutrition' },
		{ id: 'packaging', label: 'Packaging' }
	];

	function getAllImages(code: string) {
		const images = [];
		for (const photoType of photoTypes) {
			const imageName = `${photoType.id}_${code}`;
			const imageUrl = getImageUrl($product.code, imageName);
			if (imageUrl) {
				images.push({
					url: imageUrl,
					alt: `${photoType.label} image for ${getLanguage(code)}`,
					type: photoType.label
				});
			}
		}

		for (const [key] of Object.entries(get(product).images)) {
			if (key.endsWith(`_${code}`) && !photoTypes.some((pt) => key === `${pt.id}_${code}`)) {
				const imageUrl = getImageUrl($product.code, key);
				if (imageUrl) {
					images.push({
						url: imageUrl,
						alt: `${key} for ${getLanguage(code)}`,
						type: key.split('_')[0]
					});
				}
			}
		}

		return images;
	}
</script>

<div class="mb-6">
	<h3 class="mb-4 text-xl font-bold">{$_('product.edit.photos')}</h3>

	<div class="tabs mb-2">
		{#each Object.keys($product.languages_codes) as code (code)}
			<input
				type="radio"
				name="photo_tabs"
				class="tab"
				aria-label={getLanguage(code)}
				defaultChecked={code === $product.lang}
			/>
			<div class="tab-content">
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
						<div class="flex w-full items-center justify-center bg-gray-50 p-4">
							<p class="text-sm text-gray-500">{$_('product.edit.no_photo_available')}</p>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
