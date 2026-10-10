<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { invalidateAll } from '$app/navigation';
	import { _ } from '$lib/i18n';
	import { getToastCtx } from '$lib/stores/toasts';
	import { userInfo } from '$lib/stores/user';
	import { trackOffEvent } from '$lib/analytics';
	import { getLanguageName } from '$lib/languages';
	import { IMAGE_REPORT_URL } from '$lib/const';
	import {
		fileToBase64,
		uploadImageV3,
		unselectImageV3,
		selectAndCropImagesV3,
		createImageSelectionWithCrop,
		createSimpleImageSelection,
		getProductImageUrl,
		type Product,
		type ProductImage,
		type RawImage
	} from '$lib/api';

	import ImageButton from '../ImageButton.svelte';
	import PhotoEditDialog from './PhotoEditDialog.svelte';
	import PhotoSelectDialog from './PhotoSelectDialog.svelte';

	import IconMdiPencil from '@iconify-svelte/mdi/pencil';
	import IconMdiImagePlus from '@iconify-svelte/mdi/image-plus';
	import IconMdiUpload from '@iconify-svelte/mdi/upload';
	import IconMdiImageRemove from '@iconify-svelte/mdi/image-remove';
	import IconMdiTextRecognition from '@iconify-svelte/mdi/text-recognition';

	type Props = {
		product: Product;
		imageType: 'ingredients' | 'nutrition' | 'front' | 'packaging';
		languageCode: string;
		label: string;
		showOcrButton?: boolean;
		ocrLoading?: boolean;
		onPerformOcr?: () => void;
	};

	let {
		product,
		imageType,
		languageCode,
		label,
		showOcrButton = false,
		ocrLoading = false,
		onPerformOcr
	}: Props = $props();

	const toast = getToastCtx();

	let currentProductImage = $derived.by((): ProductImage | null => {
		const productImages = product.images;
		if (!productImages) return null;

		const imageName = `${imageType}_${languageCode}`;
		if (!(imageName in productImages)) return null;

		const imageData = productImages[imageName];
		if (
			!imageData ||
			typeof imageData !== 'object' ||
			!('imgid' in imageData) ||
			!imageData.imgid
		) {
			return null;
		}

		const imageUrl = getProductImageUrl(product.code, imageName, productImages);
		if (!imageUrl) return null;

		const imgid = parseInt(String(imageData.imgid), 10);
		if (isNaN(imgid)) return null;

		const originalImage = productImages[imgid] as RawImage;
		const languageName = getLanguageName(languageCode);

		return {
			url: imageUrl,
			alt: `${label} photo${languageName ? ` for ${languageName}` : ''}`,
			type: label,
			imgid,
			typeId: imageType,
			uploaded_t: originalImage?.uploaded_t || 0,
			uploader: originalImage?.uploader || 'unknown'
		};
	});

	let allAvailableImages = $derived.by((): ProductImage[] => {
		const productImages = product.images || {};
		const images: ProductImage[] = [];
		const addedImgids = new SvelteSet<number>();
		const languageName = getLanguageName(languageCode);

		// Numeric keys first (raw uploaded images)
		const numericKeys = Object.keys(productImages).filter((key) => /^\d+$/.test(key));
		for (const key of numericKeys) {
			const imgObj = productImages[key] as RawImage;
			if (!imgObj?.sizes?.['400']) continue;

			const url = getProductImageUrl(product.code, key, productImages);
			if (!url) continue;

			const imgid = parseInt(key, 10);
			if (isNaN(imgid)) continue;

			addedImgids.add(imgid);
			images.push({
				url,
				alt: `Photo #${imgid}${languageName ? ` for ${languageName}` : ''}`,
				type: 'Other',
				imgid,
				typeId: 'other',
				uploaded_t: imgObj?.uploaded_t || 0,
				uploader: imgObj?.uploader || 'unknown'
			});
		}

		// Named image keys
		for (const [key, imageData] of Object.entries(productImages)) {
			if (
				!imageData ||
				typeof imageData !== 'object' ||
				!('imgid' in imageData) ||
				!imageData.imgid
			)
				continue;

			const imgid = parseInt(String(imageData.imgid), 10);
			if (isNaN(imgid) || addedImgids.has(imgid)) continue;

			const url = getProductImageUrl(product.code, key, productImages);
			if (!url) continue;

			const uploaded_t =
				typeof imageData === 'object' && imageData && 'uploaded_t' in imageData
					? Number(imageData.uploaded_t) || 0
					: 0;
			const uploader =
				typeof imageData === 'object' && imageData && 'uploader' in imageData
					? String(imageData.uploader) || 'unknown'
					: 'unknown';

			addedImgids.add(imgid);
			images.push({
				url,
				alt: `Photo #${imgid}${languageName ? ` for ${languageName}` : ''}`,
				type: 'Other',
				imgid,
				typeId: 'other',
				uploaded_t,
				uploader
			});
		}

		return images;
	});

	let editingModal = $state<PhotoEditDialog | undefined>();
	let selectingModal = $state<PhotoSelectDialog | undefined>();
	let fileInput = $state<HTMLInputElement | undefined>();

	let isUploading = $state(false);
	let isSaving = $state(false);
	let isSelecting = $state(false);
	let isUnselecting = $state(false);

	function openCropModal() {
		editingModal?.openModal();
	}

	function openSelectModal() {
		selectingModal?.openModal();
	}

	function triggerUpload() {
		fileInput?.click();
	}

	async function handleFileUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const file = input.files[0];
		const imagefield = `${imageType}_${languageCode}`;
		const barcode = product.code;

		if ($userInfo == null) {
			toast.warning($_('product.edit.images.toast.login_required'));
			input.value = '';
			return;
		}

		isUploading = true;

		try {
			const base64Data = await fileToBase64(file);
			const uploadResult = await uploadImageV3(fetch, barcode, base64Data, imagefield);

			if (!uploadResult || uploadResult.error || !uploadResult.data) {
				toast.error($_('product.edit.images.toast.upload_failed_generic'));
				return;
			}

			const status = uploadResult.data?.status;
			if (status === 'success' || status === 'success_with_warnings') {
				toast.success(
					$_('product.edit.images.toast.upload_success', {
						default: 'Image uploaded successfully.'
					})
				);
				trackOffEvent('contribution', 'image_upload_succeeded', imageType);
				await invalidateAll();
			} else {
				const errorMessages =
					uploadResult.data?.errors && uploadResult.data.errors.length > 0
						? uploadResult.data.errors.join(', ')
						: 'Unknown error';
				toast.error(
					$_('product.edit.images.toast.upload_failed', { values: { error: errorMessages } })
				);
			}
		} catch (err) {
			console.error('Image upload failed:', err);
			toast.error($_('product.edit.images.toast.upload_error'));
		} finally {
			isUploading = false;
			input.value = '';
		}
	}

	async function handleSaveCrop(data: {
		cropData: { x: number; y: number; width: number; height: number };
		rotationAngle: number;
	}) {
		if (isSaving || !currentProductImage) return;

		isSaving = true;

		try {
			const { cropData, rotationAngle } = data;
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
				imageType,
				languageCode,
				currentProductImage.imgid,
				params
			);

			const result = await selectAndCropImagesV3(fetch, product.code, imageSelectionData);
			if (result.data?.status === 'success') {
				toast.success($_('product.edit.images.toast.save_success'));
				trackOffEvent('contribution', 'image_crop_saved', imageType);
				await invalidateAll();
			} else {
				toast.error(
					$_('product.edit.images.toast.save_failed', { default: 'Failed to process image.' })
				);
				return;
			}
			editingModal?.closeModal();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('Error processing image:', error);
			toast.error(
				$_('product.edit.images.toast.process_error', {
					values: { error: errorMessage }
				})
			);
		} finally {
			isSaving = false;
		}
	}

	async function handleSelectPhoto(selectedImage: ProductImage) {
		isSelecting = true;
		try {
			const selectionData = createSimpleImageSelection(
				imageType,
				languageCode,
				selectedImage.imgid
			);

			const result = await selectAndCropImagesV3(fetch, product.code, selectionData);
			if (result.data?.status === 'success' || result.data?.status === 'success_with_warnings') {
				await invalidateAll();
				toast.success($_('product.edit.images.toast.select_success'));
			} else {
				toast.error($_('product.edit.images.toast.select_error'));
			}
		} catch (error) {
			console.error('Error selecting image:', error);
			toast.error($_('product.edit.images.toast.select_error'));
		} finally {
			isSelecting = false;
		}
	}

	async function handleUnselectPhoto() {
		isUnselecting = true;
		try {
			const result = await unselectImageV3(fetch, product.code, imageType, languageCode);
			if (result.data?.status === 'success') {
				toast.success($_('product.edit.images.toast.unselect_success'));
				trackOffEvent('contribution', 'image_unselected', imageType);
				await invalidateAll();
				editingModal?.closeModal();
			} else {
				toast.error($_('product.edit.images.toast.unselect_failed'));
			}
		} catch (error) {
			console.error('Error unselecting image:', error);
			toast.error($_('product.edit.images.toast.unselect_error'));
		} finally {
			isUnselecting = false;
		}
	}
</script>

<input
	bind:this={fileInput}
	type="file"
	accept="image/*"
	class="hidden"
	disabled={isUploading}
	onchange={handleFileUpload}
/>

<div class="space-y-3">
	{#if currentProductImage}
		<div class="group relative flex flex-col items-center">
			<div class="relative max-h-80 overflow-hidden rounded-lg border border-base-300">
				<ImageButton
					src={currentProductImage.url}
					alt={currentProductImage.alt}
					productCode={product.code}
					rawImageId={currentProductImage.imgid}
				/>
			</div>

			<div class="mt-3 flex flex-wrap items-center justify-center gap-2">
				<button
					type="button"
					class="btn btn-primary btn-xs sm:btn-sm"
					onclick={openCropModal}
					disabled={isUploading || isSaving || isSelecting || isUnselecting}
				>
					<IconMdiPencil class="h-4 w-4" aria-hidden="true" />
					<span>{$_('product.edit.images.edit_photo', { default: 'Crop / Edit Photo' })}</span>
				</button>

				{#if allAvailableImages.length > 0}
					<button
						type="button"
						class="btn btn-outline btn-xs sm:btn-sm"
						class:loading={isSelecting}
						disabled={isUploading || isSaving || isSelecting || isUnselecting}
						onclick={openSelectModal}
					>
						<IconMdiImagePlus class="h-4 w-4" aria-hidden="true" />
						<span
							>{$_('product.edit.images.select_type', {
								values: { type: label },
								default: `Select ${label} Photo`
							})}</span
						>
					</button>
				{/if}

				<button
					type="button"
					class="btn btn-outline btn-xs sm:btn-sm"
					class:loading={isUploading}
					disabled={isUploading || isSaving || isSelecting || isUnselecting}
					onclick={triggerUpload}
				>
					<IconMdiUpload class="h-4 w-4" aria-hidden="true" />
					<span>{$_('product.edit.images.replace', { default: 'Replace Photo' })}</span>
				</button>

				<button
					type="button"
					class="btn btn-outline btn-error btn-xs sm:btn-sm"
					class:loading={isUnselecting}
					disabled={isUploading || isSaving || isSelecting || isUnselecting}
					onclick={handleUnselectPhoto}
				>
					<IconMdiImageRemove class="h-4 w-4" aria-hidden="true" />
					<span>{$_('product.edit.images.unselect_image', { default: 'Unselect' })}</span>
				</button>

				{#if showOcrButton && onPerformOcr}
					<button
						type="button"
						class="btn btn-outline btn-xs sm:btn-sm"
						class:loading={ocrLoading}
						disabled={ocrLoading || isUploading || isSaving || isSelecting || isUnselecting}
						onclick={onPerformOcr}
					>
						{#if ocrLoading}
							<span class="loading h-4 w-4 loading-spinner"></span>
							<span>{$_('product.edit.images.ocr_extracting', { default: 'Extracting ingredients...' })}</span>
						{:else}
							<IconMdiTextRecognition class="h-4 w-4" />
							<span>{$_('product.edit.images.ocr_extract', { default: 'Extract ingredients from image' })}</span>
						{/if}
					</button>
				{/if}
			</div>
		</div>
	{:else}
		<div
			class="flex flex-col items-center justify-center rounded-lg border border-dashed border-base-300 p-6 text-center"
		>
			<p class="mb-4 text-sm text-base-content/70 sm:text-base">
				{imageType === 'ingredients'
					? $_('product.edit.no_ingredients_image', {
							default: 'No ingredients image available.'
						})
					: $_('product.edit.no_nutrition_image', {
							values: { language: getLanguageName(languageCode) },
							default: `No nutrition image for ${getLanguageName(languageCode)}.`
						})}
			</p>

			<div class="flex flex-wrap items-center justify-center gap-2">
				<button
					type="button"
					class="btn btn-primary btn-xs sm:btn-sm"
					class:loading={isUploading}
					disabled={isUploading || isSelecting}
					onclick={triggerUpload}
				>
					<IconMdiUpload class="h-4 w-4" aria-hidden="true" />
					<span
						>{$_('product.edit.images.upload_type', {
							values: { type: label },
							default: `Upload ${label} photo`
						})}</span
					>
				</button>

				{#if allAvailableImages.length > 0}
					<button
						type="button"
						class="btn btn-outline btn-xs sm:btn-sm"
						class:loading={isSelecting}
						disabled={isUploading || isSelecting}
						onclick={openSelectModal}
					>
						<IconMdiImagePlus class="h-4 w-4" aria-hidden="true" />
						<span
							>{$_('product.edit.images.select_type', {
								values: { type: label },
								default: `Select ${label} photo`
							})}</span
						>
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

{#if currentProductImage}
	<PhotoEditDialog
		bind:this={editingModal}
		reportImageUrl={IMAGE_REPORT_URL(product.code, currentProductImage.imgid)}
		image={currentProductImage}
		onClose={() => {}}
		onSave={handleSaveCrop}
		{isSaving}
		onImageUnselected={handleUnselectPhoto}
		onImageReplace={triggerUpload}
	/>
{/if}

<PhotoSelectDialog
	bind:this={selectingModal}
	images={allAvailableImages}
	onSelect={handleSelectPhoto}
/>
