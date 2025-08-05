<script lang="ts">
	import ISO6391 from 'iso-639-1';
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';
	import { getProductImageUrl } from '$lib/api/product';
	import PhotoTypeSection from './PhotoTypeSection.svelte';
	import PhotoEditModal from './PhotoEditModal.svelte';
	import { prepareImageEditPayload, type ImageEditData } from '$lib/utils/imageEdit';
	import { SvelteSet } from 'svelte/reactivity';

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
						type: 'Additional'
					});
				}
			});

		// Returns the combined standard and additional(non-standard) images
		return [...standardImages, ...additionalImages];
	}

	let activeLanguageCode = $state(product.lang || Object.keys(product.languages_codes)[0]);
	let currentImages = $derived(getImagesForLanguage(activeLanguageCode));
	let expandedCategories = $state(new Set<string>());

	let fileInputValues = $state<Record<string, string>>({});

	// Photo edit modal state
	let isEditModalOpen = $state(false);
	let editingImageUrl = $state('');
	let editingImageAlt = $state('');

	function handleLanguageChange(code: string) {
		activeLanguageCode = code;
		// Reset expanded categories when language changes
		expandedCategories = new SvelteSet<string>();
		fileInputValues = {};
	}

	function toggleCategoryExpansion(type: string) {
		if (expandedCategories.has(type)) {
			expandedCategories.delete(type);
		} else {
			expandedCategories.add(type);
		}
		expandedCategories = new SvelteSet(expandedCategories);
	}

	function handleFileInputChange(key: string, value: string) {
		fileInputValues[key] = value;
	}

	function openEditModal(imageUrl: string, imageAlt: string) {
		editingImageUrl = imageUrl;
		editingImageAlt = imageAlt;
		isEditModalOpen = true;
	}

	function closeEditModal() {
		isEditModalOpen = false;
		editingImageUrl = '';
		editingImageAlt = '';
	}

	function handleImageEdit(data: ImageEditData) {
		const editPayload = prepareImageEditPayload(
			product,
			editingImageUrl,
			data,
			activeLanguageCode,
			'front' // TODO: Replace with actual image type from data
		);

		console.log('Prepared edit payload for backend:', editPayload);

		// TODO: Send to backend API

		// For now, showing an alert with the formatted data
		console.log(`Image edit data prepared for backend:
		Barcode: ${editPayload.barcode}
		Image ID: ${editPayload.imageId}
		Language: ${editPayload.language}
		Image Type: ${editPayload.imageType}
		Crop: x=${editPayload.crop.x}, y=${editPayload.crop.y}, width=${editPayload.crop.width}, height=${editPayload.crop.height}
		Rotation: ${editPayload.rotation}°

		This data is now ready to be sent to the backend API.`);

		closeEditModal();
	}
</script>

<div class="mb-4 sm:mb-6">
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
				<!-- Show standard photo types first -->
				{#each photoTypes as photoType (photoType.id)}
					<PhotoTypeSection
						{photoType}
						{activeLanguageCode}
						{currentImages}
						{expandedCategories}
						{fileInputValues}
						{product}
						{photoTypes}
						onToggleExpansion={toggleCategoryExpansion}
						onFileInputChange={handleFileInputChange}
						onImageEdit={openEditModal}
					/>
				{/each}

				<!-- Show additional image types that are not standard -->
				{#each [...new Set(currentImages
							.map((img) => img.type)
							.filter((type) => !photoTypes.some((pt) => pt.label === type)))] as type (type)}
					<PhotoTypeSection
						photoType={{ id: type.toLowerCase(), label: type, isAdditional: true }}
						{activeLanguageCode}
						{currentImages}
						{expandedCategories}
						{fileInputValues}
						{product}
						{photoTypes}
						onToggleExpansion={toggleCategoryExpansion}
						onFileInputChange={handleFileInputChange}
						onImageEdit={openEditModal}
					/>
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

<!-- Photo Edit Modal -->
<PhotoEditModal
	isOpen={isEditModalOpen}
	imageUrl={editingImageUrl}
	imageAlt={editingImageAlt}
	onClose={closeEditModal}
	onSave={handleImageEdit}
/>
