<script lang="ts">
	import ISO6391 from 'iso-639-1';
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';
	import { getProductImageUrl } from '$lib/api/product';
	import { ProductsApi } from '$lib/api';
	import { preferences } from '$lib/settings';

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
		const additionalImages: { url: string; alt: string; type: string }[] = [];

		// 1. Images with keys ending in _{code} that are not standard
		Object.keys(productImages)
			.filter(
				(key) => key.endsWith(`_${code}`) && !photoTypes.some((pt) => key === `${pt.id}_${code}`)
			)
			.forEach((key) => {
				const imageUrl = getProductImageUrl(product.code, key, productImages);
				if (imageUrl) {
					additionalImages.push({
						url: imageUrl,
						alt: `${key} for ${getLanguage(code)}`,
						type: key.split('_')[0]
					});
				}
			});

		// 2. Numeric keys (raw images)
		Object.keys(productImages)
			.filter((key) => /^\d+$/.test(key))
			.forEach((key) => {
				const imgObj = productImages[key];
				let url = null;
				if (imgObj && imgObj.sizes && imgObj.sizes['400']) {
					url = getProductImageUrl(product.code, key, productImages);
				}
				if (url) {
					additionalImages.push({
						url,
						alt: `Additional image ${key}`,
						type: 'additional'
					});
				}
			});

		// Returns the combined standard and additional(non-standard) images
		return [...standardImages, ...additionalImages];
	}

	let activeLanguageCode = $state(product.lang || Object.keys(product.languages_codes)[0]);
	let currentImages = $derived(getImagesForLanguage(activeLanguageCode));
	let expandedCategories = $state(new Set<string>());

	function handleLanguageChange(code: string) {
		activeLanguageCode = code;
		// Reset expanded categories when language changes
		expandedCategories = new Set<string>();
	}

	function toggleCategoryExpansion(type: string) {
		if (expandedCategories.has(type)) {
			expandedCategories.delete(type);
		} else {
			expandedCategories.add(type);
		}
		expandedCategories = new Set(expandedCategories);
	}

	function triggerFileInput(id: string) {
		const input = document.getElementById(id) as HTMLInputElement;
		if (input) input.click();
	}

	async function handleImageUpload(e: Event, type: string) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const file = input.files[0];

		// Map type to OpenFoodFacts imagefield value
		let imagefield = '';
		const typeId = photoTypes.find((pt) => pt.label === type)?.id || type.toLowerCase();

		switch (typeId) {
			case 'front':
				imagefield = `front_${activeLanguageCode}`;
				break;
			case 'ingredients':
				imagefield = `ingredients_${activeLanguageCode}`;
				break;
			case 'nutrition':
				imagefield = `nutrition_${activeLanguageCode}`;
				break;
			case 'packaging':
				imagefield = `packaging_${activeLanguageCode}`;
				break;
			default:
				imagefield = `${typeId}_${activeLanguageCode}`;
		}

		const barcode = product.code;
		const user_id = $preferences.username;
		const password = $preferences.password;

		if (!user_id || !password) {
			alert('Please set your OpenFoodFacts username and password in settings.');
			return;
		}

		try {
			const api = new ProductsApi(fetch);
			const result = await api.uploadImage(barcode, file, imagefield);

			// TODO: show notification of success and remove alert
			alert('Image uploaded successfully!');
			// Reload the page to show the new image
			window.location.reload();
		} catch (err) {
			console.error('Image upload failed:', err);
			alert('Image upload failed. Please try again.');
		}

		input.value = '';
	}
</script>

<div class="mb-4 sm:mb-6">
	<h3 class="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">{$_('product.edit.photos')}</h3>

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
			<div class="tab-content p-3 sm:p-6" class:hidden={code !== activeLanguageCode}>
				{console.log('current Images', currentImages)}

				<!-- Show standard photo types first -->
				{#each photoTypes as photoType}
					{@const imagesOfType = currentImages.filter((img) => img.type === photoType.label)}
					{@const isExpanded = expandedCategories.has(photoType.label)}
					{@const imagesToShow = isExpanded ? imagesOfType : imagesOfType.slice(0, 10)}
					{@const hasMoreImages = imagesOfType.length > 10}

					<div class="mb-6">
						<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<h4 class="sm:text-md text-sm font-semibold">
								{photoType.label} picture ({getLanguage(activeLanguageCode)})
							</h4>
							<div class="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
								<!-- Upload button for this category -->
								<input
									id="{photoType.id}-{activeLanguageCode}-upload"
									type="file"
									accept="image/*"
									class="hidden"
									onchange={(e) => handleImageUpload(e, photoType.label)}
								/>
								<button
									type="button"
									class="btn btn-xs sm:btn-sm btn-outline w-full sm:w-auto"
									onclick={() => triggerFileInput(`${photoType.id}-${activeLanguageCode}-upload`)}
								>
									<span class="icon-[mdi--upload] h-3 w-3 sm:h-4 sm:w-4"></span>
									<span class="text-xs sm:text-sm">Upload {photoType.label}</span>
								</button>
								{#if hasMoreImages}
									<button
										type="button"
										class="btn btn-xs sm:btn-sm btn-outline w-full sm:w-auto"
										onclick={() => toggleCategoryExpansion(photoType.label)}
									>
										<span class="text-xs sm:text-sm"
											>{isExpanded ? 'Show Less' : `See All (${imagesOfType.length})`}</span
										>
									</button>
								{/if}
							</div>
						</div>
						{#if imagesOfType.length > 0}
							<div
								class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
							>
								{#each imagesToShow as image (image.url)}
									<div class="aspect-square overflow-hidden rounded border">
										<img src={image.url} alt={image.alt} class="h-full w-full object-cover" />
									</div>
								{/each}
							</div>
						{:else}
							<div class="bg-base-200 flex w-full items-center justify-center rounded p-3 sm:p-4">
								<p class="text-base-content/60 text-center text-xs sm:text-sm">
									No {photoType.label.toLowerCase()} photos available
								</p>
							</div>
						{/if}
					</div>
				{/each}

				<!-- Show additional image types that are not standard -->
				{#each [...new Set(currentImages
							.map((img) => img.type)
							.filter((type) => !photoTypes.some((pt) => pt.label === type)))] as type}
					{@const imagesOfType = currentImages.filter((img) => img.type === type)}
					{@const isExpanded = expandedCategories.has(type)}
					{@const imagesToShow = isExpanded ? imagesOfType : imagesOfType.slice(0, 10)}
					{@const hasMoreImages = imagesOfType.length > 10}

					<div class="mb-6">
						<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<h4 class="sm:text-md text-sm font-semibold">
								{type} picture ({getLanguage(activeLanguageCode)})
							</h4>
							<div class="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
								<!-- Upload button for this category -->
								<input
									id="{type.toLowerCase()}-{activeLanguageCode}-upload"
									type="file"
									accept="image/*"
									class="hidden"
									onchange={(e) => handleImageUpload(e, type)}
								/>
								<button
									type="button"
									class="btn btn-xs sm:btn-sm btn-outline w-full sm:w-auto"
									onclick={() =>
										triggerFileInput(`${type.toLowerCase()}-${activeLanguageCode}-upload`)}
								>
									<span class="icon-[mdi--upload] h-3 w-3 sm:h-4 sm:w-4"></span>
									<span class="text-xs sm:text-sm">Upload {type}</span>
								</button>
								{#if hasMoreImages}
									<button
										type="button"
										class="btn btn-xs sm:btn-sm btn-outline w-full sm:w-auto"
										onclick={() => toggleCategoryExpansion(type)}
									>
										<span class="text-xs sm:text-sm"
											>{isExpanded ? 'Show Less' : `See All (${imagesOfType.length})`}</span
										>
									</button>
								{/if}
							</div>
						</div>
						<div
							class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
						>
							{#each imagesToShow as image (image.url)}
								<div class="aspect-square overflow-hidden rounded border">
									<img src={image.url} alt={image.alt} class="h-full w-full object-cover" />
								</div>
							{/each}
						</div>
					</div>
				{/each}

				<!-- Show message if no images at all -->
				{#if currentImages.length === 0}
					<div class="bg-base-200 flex w-full items-center justify-center rounded p-4 sm:p-6">
						<p class="text-base-content/60 text-center text-sm sm:text-base">
							{$_('product.edit.no_photo_available')}
						</p>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
