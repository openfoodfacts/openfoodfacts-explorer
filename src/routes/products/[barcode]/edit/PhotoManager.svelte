<script lang="ts">
	import ISO6391 from 'iso-639-1';
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';
	import { getProductImageUrl } from '$lib/api/product';

	type Props = { product: Product };
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

	// Get all images for a specific language code
	function getImagesForLanguage(code: string): ProductImage[] {
		const productImages = product.images;

		// Get standard images (front, ingredients, nutrition, packaging)
		const standardImages = photoTypes
			.map((photoType) => {
				const imageName = `${photoType.id}_${code}`;
				const imageUrl = getProductImageUrl(product.code, imageName, productImages);

				if (imageUrl == null) {
					return null;
				}

				return {
					url: imageUrl,
					alt: `${photoType.label} image for ${getLanguage(code)}`,
					type: photoType.label
				};
			})
			.filter((img): img is ProductImage => img !== null);

		// Get additional non-standard images for this language
		const additionalImages = Object.keys(productImages)
			.filter(
				// Finds the images ending with this language code, but not part of standard types
				// for example: includes "organic_certification_en" but excludes "front_en"
				(key) => key.endsWith(`_${code}`) && !photoTypes.some((pt) => key === `${pt.id}_${code}`)
			)
			.map((key) => {
				const imageUrl = getProductImageUrl(product.code, key, productImages);

				if (imageUrl == null) {
					return null;
				}

				return {
					url: imageUrl,
					alt: `${key} for ${getLanguage(code)}`,
					type: key.split('_')[0]
				};
			})
			.filter((img): img is ProductImage => img !== null);

		// Returns the combined standard and additional(non-standard) images
		return [...standardImages, ...additionalImages];
	}

	let activeLanguageCode = $state(product.lang || Object.keys(product.languages_codes)[0]);
	let currentImages = $derived(getImagesForLanguage(activeLanguageCode));

	function handleLanguageChange(code: string) {
		activeLanguageCode = code;
	}
</script>

<div class="mb-6">
	<h3 class="mb-4 text-xl font-bold">{$_('product.edit.photos')}</h3>

	<div class="tabs tabs-box">
		{#each Object.keys(product.languages_codes) as code (code)}
			<input
				type="radio"
				name="photo_tabs"
				class="tab"
				aria-label={getLanguage(code)}
				checked={code === activeLanguageCode}
				onchange={() => handleLanguageChange(code)}
			/>
			<div class="tab-content p-6" class:hidden={code !== activeLanguageCode}>
				<h4 class="text-md mb-3 font-semibold">
					{photoTypes[0].label} picture ({getLanguage(activeLanguageCode)})
				</h4>

				<div class="flex flex-wrap gap-3">
					{#if currentImages.length > 0}
						{#each currentImages as image (image.url)}
							<div class="h-40 w-40 overflow-hidden border">
								<img src={image.url} alt={image.alt} class="h-full w-full object-contain" />
							</div>
						{/each}
					{:else}
						<div class="bg-base-200 flex w-full items-center justify-center p-4">
							<p class="text-base-content/60 text-sm">{$_('product.edit.no_photo_available')}</p>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
