<script lang="ts">
	import ISO6391 from 'iso-639-1';
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';
	import { getProductImageUrl } from '$lib/api/product';
	import PhotoTypeSection from './PhotoTypeSection.svelte';
	import PhotoEditModal from './PhotoEditModal.svelte';
	import type { ImageEditData } from '$lib/utils/imageEdit';
	import { SvelteSet } from 'svelte/reactivity';

	type Props = { product: Product };
	let { product }: Props = $props();

	const languageCache = new Map<string, string>();
	function getLanguage(code: string): string {
		if (!languageCache.has(code)) {
			languageCache.set(code, ISO6391.getName(code));
		}
		return languageCache.get(code)!;
	}

	const photoTypes = [
		{ id: 'front', label: 'Front' },
		{ id: 'ingredients', label: 'Ingredients' },
		{ id: 'nutrition', label: 'Nutrition' },
		{ id: 'packaging', label: 'Packaging' }
	];

	const photoTypeIds = new Set(photoTypes.map(pt => pt.id));

	type ProductImage = {
		url: string;
		alt: string;
		type: string;
		imgid: number; // The numeric image ID for the API
		typeId: string; // The type ID for the API (front, ingredients, nutrition, packaging, other)
	};

	function createProductImage(
		url: string,
		imgid: number,
		type: string,
		typeId: string,
		altSuffix: string = ''
	): ProductImage {
		return {
			url,
			alt: `${type} image${altSuffix}`,
			type,
			imgid,
			typeId
		};
	}

	function getStandardImages(code: string): ProductImage[] {
		const productImages = product.images;
		const languageName = getLanguage(code);
		const images: ProductImage[] = [];

		for (const photoType of photoTypes) {
			const imageName = `${photoType.id}_${code}`;
			const imageData = productImages[imageName];
			
			if (!imageData || !('imgid' in imageData) || !imageData.imgid) {
				continue;
			}

			const imageUrl = getProductImageUrl(product.code, imageName, productImages);
			if (!imageUrl) continue;

			const imgid = parseInt(imageData.imgid, 10);
			if (isNaN(imgid)) continue;

			images.push(createProductImage(
				imageUrl,
				imgid,
				photoType.label,
				photoType.id,
				` for ${languageName}`
			));
		}

		return images;
	}

	function getAdditionalImages(code: string): ProductImage[] {
		const productImages = product.images;
		const languageName = getLanguage(code);
		const images: ProductImage[] = [];

		const languageKeys = Object.keys(productImages).filter(key => 
			key.endsWith(`_${code}`) && !photoTypeIds.has(key.split('_')[0])
		);

		for (const key of languageKeys) {
			const imageData = productImages[key];
			if (!imageData || !('imgid' in imageData) || !imageData.imgid) continue;

			const imageUrl = getProductImageUrl(product.code, key, productImages);
			if (!imageUrl) continue;

			const imgid = parseInt(imageData.imgid, 10);
			if (isNaN(imgid)) continue;

			const typePrefix = key.split('_')[0];
			const typeId = photoTypeIds.has(typePrefix) ? typePrefix : 'other';

			images.push(createProductImage(
				imageUrl,
				imgid,
				typePrefix,
				typeId,
				` for ${languageName}`
			));
		}

		const numericKeys = Object.keys(productImages).filter(key => /^\d+$/.test(key));
		
		for (const key of numericKeys) {
			const imgObj = productImages[key];
			if (!imgObj?.sizes?.['400']) continue;

			const url = getProductImageUrl(product.code, key, productImages);
			if (!url) continue;

			const imgid = parseInt(key, 10);
			if (isNaN(imgid)) continue;

			images.push(createProductImage(
				url,
				imgid,
				'Additional',
				'other'
			));
		}

		return images;
	}

	function getImagesForLanguage(code: string): ProductImage[] {
		return [...getStandardImages(code), ...getAdditionalImages(code)];
	}

	let activeLanguageCode = $state(product.lang || Object.keys(product.languages_codes)[0]);
	let currentImages = $derived(getImagesForLanguage(activeLanguageCode));
	let expandedCategories = $state(new Set<string>());
	let fileInputValues = $state<Record<string, string>>({});

	let isEditModalOpen = $state(false);
	let editingImageData = $state<ProductImage | null>(null);

	const additionalImageTypes = $derived.by(() => {
		const standardTypes = new Set(photoTypes.map(pt => pt.label));
		return [...new Set(
			currentImages
				.map(img => img.type)
				.filter(type => !standardTypes.has(type))
		)];
	});

	function handleLanguageChange(code: string) {
		activeLanguageCode = code;
		expandedCategories.clear();
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
		const imageData = currentImages.find((img) => img.url === imageUrl && img.alt === imageAlt);
		if (imageData) {
			editingImageData = imageData;
			isEditModalOpen = true;
		} else {
			console.error('Could not find image data for URL:', imageUrl);
		}
	}

	function closeEditModal() {
		isEditModalOpen = false;
		editingImageData = null;
	}

	async function handleImageEdit(data: ImageEditData) {
		if (!editingImageData) {
			console.error('No image data available for editing');
			return;
		}

		try {
			const { imgid: imageId, typeId: imageTypeId } = editingImageData;
			const { cropData, rotationAngle } = data;

			const hasCropData = cropData.width > 0 && cropData.height > 0;

			if (hasCropData) {
				await handleImageCropAndRotate(imageId, imageTypeId, cropData, rotationAngle);
			} else {
				await handleImageRotateOnly(imageId, imageTypeId, rotationAngle);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('Error processing image:', error);
			alert(`Error processing image: ${errorMessage}. Please try again.`);
		} finally {
			closeEditModal();
		}
	}

	async function handleImageCropAndRotate(
		imageId: number,
		imageTypeId: string,
		cropData: { x: number; y: number; width: number; height: number },
		rotationAngle: number
	) {
		// Prepare crop data for API
		const apiCropData = {
			x1: Math.round(cropData.x),
			y1: Math.round(cropData.y),
			x2: Math.round(cropData.x + cropData.width),
			y2: Math.round(cropData.y + cropData.height),
			angle: rotationAngle
		};

		// TODO: Call the crop API when it's implemented
		console.log('Cropping and rotating image with data:', {
			imageId,
			imageTypeId,
			cropData: apiCropData,
			operation: 'crop_and_rotate'
		});
	}

	async function handleImageRotateOnly(
		imageId: number,
		imageTypeId: string,
		rotationAngle: number
	) {
		// TODO: Call the rotation-only API when it's implemented
		console.log('Rotating image with data:', {
			imageId,
			imageTypeId,
			rotationData: { angle: rotationAngle },
			operation: 'rotate_only'
		});
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
				{#each additionalImageTypes as type (type)}
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
	imageUrl={editingImageData?.url || ''}
	imageAlt={editingImageData?.alt || ''}
	onClose={closeEditModal}
	onSave={handleImageEdit}
/>
