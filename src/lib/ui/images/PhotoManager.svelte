<script lang="ts">
	import ISO6391 from 'iso-639-1';
	import { tick, untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	import { invalidateAll } from '$app/navigation';

	import { _ } from '$lib/i18n';
	import type { Product, ProductImage, RawImage } from '$lib/api';
	import {
		getProductImageUrl,
		createImageSelectionWithCrop,
		createSimpleImageSelection,
		selectAndCropImagesV3,
		unselectImageV3
	} from '$lib/api/product';
	import type { ImageEditData } from '$lib/utils/imageEdit';
	import { getToastCtx } from '$lib/stores/toasts';

	import PhotoTypeSection from './PhotoTypeSection.svelte';
	import PhotoEditDialog from './PhotoEditDialog.svelte';
	import PhotoSelectDialog from './PhotoSelectDialog.svelte';
	import { IMAGE_REPORT_URL } from '$lib/const';

	type Props = { product: Product };
	let { product }: Props = $props();

	const toast = getToastCtx();

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

	function getStandardImages(code: string) {
		const productImages = product.images;
		const languageName = getLanguage(code);
		const images: ProductImage[] = [];

		for (const photoType of photoTypes) {
			const imageName = `${photoType.id}_${code}`;
			if (!(imageName in productImages)) {
				continue; // No image data found for this photo type
			}

			const imageData = productImages[imageName];

			if (!('imgid' in imageData) || !imageData.imgid) {
				console.warn(`No imgid found for ${imageName} in product images: `, imageData);
				continue; // No valid image data found for this photo type
			}

			const imageUrl = getProductImageUrl(product.code, imageName, productImages);
			if (!imageUrl) continue;

			const imgid = parseInt(imageData.imgid, 10);
			if (isNaN(imgid)) continue;

			const originalImage = productImages[imgid] as RawImage;

			images.push({
				url: imageUrl,
				alt: `${photoType.label} photo${languageName ? ` for ${languageName}` : ''}`,
				type: photoType.label,
				imgid,
				typeId: photoType.id,
				uploaded_t: originalImage?.uploaded_t || 0,
				uploader: originalImage?.uploader || 'unknown'
			});
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

			const rawImage = productImages[imgid] as RawImage;

			images.push({
				url: imageUrl,
				alt: `Additional photo (${typePrefix})${languageName ? ` for ${languageName}` : ''}`,
				type: typePrefix.charAt(0).toUpperCase() + typePrefix.slice(1),
				imgid,
				typeId,
				uploaded_t: rawImage?.uploaded_t || 0,
				uploader: rawImage?.uploader || 'unknown'
			});
		}

		const numericKeys = Object.keys(productImages).filter((key) => /^\d+$/.test(key));

		for (const key of numericKeys) {
			const imgObj = productImages[key] as RawImage;
			if (!imgObj?.sizes?.['400']) continue;

			const url = getProductImageUrl(product.code, key, productImages);
			if (!url) continue;

			const imgid = parseInt(key, 10);
			if (isNaN(imgid)) continue;

			images.push({
				url,
				alt: `Additional photo${languageName ? ` for ${languageName}` : ''}`,
				type: 'Other',
				imgid,
				typeId: 'other',
				uploaded_t: imgObj?.uploaded_t || 0,
				uploader: imgObj?.uploader || 'unknown'
			});
		}

		return images;
	}

	function getImagesForLanguage(code: string) {
		return [...getStandardImages(code), ...getAdditionalImages(code)];
	}

	function getDefaultLanguage(p: Product) {
		if (p.lang) return p.lang;
		if (p.languages_codes) {
			const codes = Object.keys(p.languages_codes);
			if (codes.length > 0) return codes[0];
		}
		return 'en';
	}

	let activeLanguageCode = $state(untrack(() => getDefaultLanguage(product)));

	let currentImages = $derived(getImagesForLanguage(activeLanguageCode));
	let expandedCategories = $state(new Set<string>());

	let editingImageData: ProductImage | undefined = $state();
	let editingImageModal: PhotoEditDialog | undefined = $state();

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

	async function openEditModal(imageUrl: string, imageAlt: string) {
		const imageData = currentImages.find((img) => img.url === imageUrl && img.alt === imageAlt);
		if (!imageData) {
			console.error('Image data not found for URL:', imageUrl);
			return;
		}

		editingImageData = imageData;
		await tick(); // let svelte create the node in the DOM
		editingImageModal?.openModal();
	}

	function closeEditModal() {
		editingImageData = undefined;
	}

	// Auto-open modal when editingImageData is set
	$effect(() => {
		if (editingImageData && editingImageModal) {
			tick().then(() => {
				editingImageModal?.openModal();
			});
		}
	});

	export type UploadResult = {
		code?: string;
		status: string;
		errors?: string[];
		warnings?: string[];
		result?: {
			id: string;
			lc_name: string;
			name: string;
		};
		product?: {
			images?: {
				uploaded?: {
					[imgid: string]: {
						imgid: number;
						sizes: {
							[size: string]: {
								h: number;
								w: number;
							};
						};
						uploaded_t: number;
						uploader: string;
					};
				};
			};
		};
	};

	function handleImageUploaded(imgId: number) {
		invalidateAll().then(() => {
			setTimeout(() => {
				openUploadedImage(imgId);
			}, 1500);
		});
	}

	function openUploadedImage(imgId: number) {
		const typeImages = currentImages.filter((img) => img.imgid === imgId);

		if (typeImages.length === 0) {
			console.warn(`No images found for imgId: ${imgId}`);
			return;
		}

		const uploadedImage = typeImages[0];
		editingImageData = uploadedImage;
	}

	async function saveCurrentImage(data: ImageEditData) {
		if (!editingImageData) {
			console.error('No image data available for editing');
			return;
		}

		try {
			const { cropData, rotationAngle } = data;
			await saveImageWithSelectAndCrop(editingImageData, cropData, rotationAngle);

			toast.success($_('product.edit.images.toast.save_success'));
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('Error processing image:', error);
			toast.error(
				$_('product.edit.images.toast.process_error', { values: { error: errorMessage } })
			);
		} finally {
			await invalidateAll();
			closeEditModal();
		}
	}

	async function saveImageWithSelectAndCrop(
		image: ProductImage,
		cropData: { x: number; y: number; width: number; height: number },
		rotationAngle: number
	) {
		try {
			// Always use the same API, but include crop parameters only if there's actual cropping
			const hasCropData = cropData.width > 0 && cropData.height > 0;

			const params = {
				angle: rotationAngle,
				normalize: true,
				white_magic: false,
				...(hasCropData && {
					x1: Math.round(cropData.x),
					y1: Math.round(cropData.y),
					x2: Math.round(cropData.x + cropData.width),
					y2: Math.round(cropData.y + cropData.height)
				})
			};

			const imageSelectionData = createImageSelectionWithCrop(
				image.typeId,
				activeLanguageCode,
				image.imgid,
				params
			);

			await selectAndCropImagesV3(fetch, product.code, imageSelectionData);
		} catch (error) {
			console.error('Error processing image with selectAndCrop API:', error);
			throw error;
		}
	}

	async function unselectCurrentImage() {
		const image = editingImageData;
		const barcode = product.code;

		if (!image) {
			console.warn('No editing image data available for unselect');
			return;
		}

		if (!product || !image.type || !activeLanguageCode || !photoTypes) {
			console.warn('Missing required data for image unselect');
			return;
		}

		try {
			const result = await unselectImageV3(fetch, barcode, image.typeId, activeLanguageCode);

			if (result.data?.status === 'success' || !result.error) {
				toast.success($_('product.edit.images.toast.unselect_success'));
				await invalidateAll();
				editingImageModal?.closeModal();
			} else {
				console.warn('Image unselect failed:', result);
				toast.error($_('product.edit.images.toast.unselect_failed'));
			}
		} catch (error) {
			console.error('Error unselecting image:', error);
			toast.error($_('product.edit.images.toast.unselect_error'));
		}
	}

	function getNutriPatrolReportUrl(image: ProductImage) {
		return IMAGE_REPORT_URL(product.code, image.imgid);
	}

	let selectingImageModal: PhotoSelectDialog | undefined = $state();
	let selectingImageSection: string | undefined = $state();
	let isSelectingImage = $state(false);

	function openImageSelection(section: string) {
		console.debug(`Opening image selection for section: ${section}`);
		selectingImageSection = section;
		selectingImageModal?.openModal();
	}

	async function onImageSelection(image: ProductImage) {
		if (!selectingImageSection) {
			console.error('No section selected for image selection');
			return;
		}

		// Set loading state
		isSelectingImage = true;

		try {
			const selectionData = createSimpleImageSelection(
				selectingImageSection,
				activeLanguageCode,
				image.imgid
			);

			await selectAndCropImagesV3(fetch, product.code, selectionData);
			await invalidateAll();
			toast.success($_('product.edit.images.toast.select_success'));
		} catch (error) {
			console.error('Error selecting image:', error);
			toast.error($_('product.edit.images.toast.select_error'));
		} finally {
			isSelectingImage = false;
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
						sectionType={photoType}
						{activeLanguageCode}
						{currentImages}
						{expandedCategories}
						{product}
						{photoTypes}
						onToggleExpansion={toggleCategoryExpansion}
						onImageEdit={openEditModal}
						onImageUploaded={handleImageUploaded}
						onSelectImage={() => openImageSelection(photoType.id)}
						isSelectingImage={isSelectingImage && selectingImageSection === photoType.id}
					/>
				{/each}

				<!-- Show additional image types that are not standard -->
				{#each additionalImageTypes as type (type)}
					<PhotoTypeSection
						sectionType={{ id: type.toLowerCase(), label: type }}
						isAdditional
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
{#if editingImageData}
	<PhotoEditDialog
		bind:this={editingImageModal}
		reportImageUrl={getNutriPatrolReportUrl(editingImageData)}
		image={editingImageData}
		onClose={closeEditModal}
		onSave={saveCurrentImage}
		onImageUnselected={unselectCurrentImage}
	/>
{/if}

<PhotoSelectDialog
	bind:this={selectingImageModal}
	images={currentImages}
	onSelect={onImageSelection}
	onClose={() => (selectingImageSection = undefined)}
/>
