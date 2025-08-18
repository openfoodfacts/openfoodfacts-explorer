<script lang="ts">
	import ISO6391 from 'iso-639-1';
	import { _ } from '$lib/i18n';
	import { invalidateAll } from '$app/navigation';
	import type { Product } from '$lib/api';
	import { getProductImageUrl } from '$lib/api/product';
	import PhotoTypeSection from './PhotoTypeSection.svelte';
	import PhotoEditModal from './PhotoEditModal.svelte';
	import type { ImageEditData } from '$lib/utils/imageEdit';
	import { SvelteSet } from 'svelte/reactivity';
	import OpenFoodFacts from '@openfoodfacts/openfoodfacts-nodejs';

	type Props = { product: Product };
	let { product }: Props = $props();

	// Use regular Map for language cache since it's not reactive data,
	// just a performance optimization to avoid repeated ISO6391.getName() calls
	// Using SvelteMap would cause state_unsafe_mutation error in $derived computations
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
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

	const photoTypeIds = new Set(photoTypes.map((pt) => pt.id));

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

			images.push(
				createProductImage(imageUrl, imgid, photoType.label, photoType.id, ` for ${languageName}`)
			);
		}

		return images;
	}

	function getAdditionalImages(code: string): ProductImage[] {
		const productImages = product.images;
		const languageName = getLanguage(code);
		const images: ProductImage[] = [];

		const languageKeys = Object.keys(productImages).filter(
			(key) => key.endsWith(`_${code}`) && !photoTypeIds.has(key.split('_')[0])
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

			images.push(createProductImage(imageUrl, imgid, typePrefix, typeId, ` for ${languageName}`));
		}

		const numericKeys = Object.keys(productImages).filter((key) => /^\d+$/.test(key));

		for (const key of numericKeys) {
			const imgObj = productImages[key];
			if (!imgObj?.sizes?.['400']) continue;

			const url = getProductImageUrl(product.code, key, productImages);
			if (!url) continue;

			const imgid = parseInt(key, 10);
			if (isNaN(imgid)) continue;

			images.push(createProductImage(url, imgid, 'Additional', 'other'));
		}

		return images;
	}

	function getImagesForLanguage(code: string): ProductImage[] {
		return [...getStandardImages(code), ...getAdditionalImages(code)];
	}

	let activeLanguageCode = $state(product.lang || Object.keys(product.languages_codes)[0]);

	let currentImages = $derived(getImagesForLanguage(activeLanguageCode));
	let expandedCategories = $state(new Set<string>());

	let isEditModalOpen = $state(false);
	let editingImageData = $state<ProductImage | null>(null);

	const additionalImageTypes = $derived.by(() => {
		const standardTypes = new Set(photoTypes.map((pt) => pt.label));
		return [
			...new Set(currentImages.map((img) => img.type).filter((type) => !standardTypes.has(type)))
		];
	});

	function handleLanguageChange(code: string) {
		activeLanguageCode = code;
		expandedCategories.clear();
	}

	function toggleCategoryExpansion(type: string) {
		if (expandedCategories.has(type)) {
			expandedCategories.delete(type);
		} else {
			expandedCategories.add(type);
		}
		expandedCategories = new SvelteSet(expandedCategories);
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

	export type UploadResult = {
		status: string;
		imgid?: string | number;
		error?: string;
		[key: string]: unknown;
	};

	async function handleImageUploaded(uploadInfo?: {
		type: string;
		imagefield: string;
		result: UploadResult;
	}) {
		await invalidateAll();

		if (uploadInfo?.result?.status === 'status ok') {
			setTimeout(() => {
				openUploadedImage({
					type: uploadInfo.type,
					result: uploadInfo.result
				});
			}, 1500);
		}
	}

	function openUploadedImage(uploadInfo: { type: string; result: UploadResult }) {
		const typeImages = currentImages.filter((img) => img.type === uploadInfo.type);

		if (typeImages.length === 0) {
			console.warn(`No images found for type: ${uploadInfo.type}`);
			return;
		}

		if (uploadInfo.result?.imgid) {
			const uploadedImage = typeImages.find(
				(img) => img.imgid.toString() === uploadInfo.result.imgid!.toString()
			);
			if (uploadedImage) {
				openEditModal(uploadedImage.url, uploadedImage.alt);
			} else {
				console.warn(`Could not find uploaded image with imgid: ${uploadInfo.result.imgid}`);
			}
		}
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
			await invalidateAll();
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
			angle: rotationAngle,
			normalize: true,
			white_magic: false
		};

		try {
			// Create the image field ID in the format {IMAGE_TYPE}_{LANG}
			const imageFieldId = `${imageTypeId}_${activeLanguageCode}`;

			const off = new OpenFoodFacts(fetch);
			const result = await off.cropImage(product.code, imageId, imageFieldId, apiCropData);
		} catch (error) {
			console.error('Error cropping and rotating image:', error);
			throw error;
		}
	}

	async function handleImageRotateOnly(
		imageId: number,
		imageTypeId: string,
		rotationAngle: number
	) {
		try {
			// Create the image field ID in the format {IMAGE_TYPE}_{LANG}
			const imageFieldId = `${imageTypeId}_${activeLanguageCode}`;

			const off = new OpenFoodFacts(fetch);
			const result = await off.rotateImage(
				product.code,
				imageFieldId,
				imageId.toString(),
				rotationAngle.toString()
			);
		} catch (error) {
			console.error('Error rotating image:', error);
			throw error;
		}
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
						{product}
						{photoTypes}
						onToggleExpansion={toggleCategoryExpansion}
						onImageEdit={openEditModal}
						onImageUploaded={handleImageUploaded}
					/>
				{/each}

				<!-- Show additional image types that are not standard -->
				{#each additionalImageTypes as type (type)}
					<PhotoTypeSection
						photoType={{ id: type.toLowerCase(), label: type, isAdditional: true }}
						{activeLanguageCode}
						{currentImages}
						{expandedCategories}
						{product}
						{photoTypes}
						onToggleExpansion={toggleCategoryExpansion}
						onImageEdit={openEditModal}
						onImageUploaded={handleImageUploaded}
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
