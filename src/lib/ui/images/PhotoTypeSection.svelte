<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	import { getImageFieldName } from '$lib/utils';
	import { fileToBase64, unselectImageV3, uploadImageV3 } from '$lib/api';
	import type { Product, ProductImage } from '$lib/api';
	import { getToastCtx } from '$lib/stores/toasts';
	import { getLanguageName } from '$lib/languages';
	import { _, getDateFormatter } from 'svelte-i18n';
	import { resolve } from '$app/paths';

	import IconMdiUpload from '@iconify-svelte/mdi/upload';
	import IconMdiImageRemove from '@iconify-svelte/mdi/image-remove';
	import IconMdiPencil from '@iconify-svelte/mdi/pencil';
	import IconMdiImagePlus from '@iconify-svelte/mdi/image-plus';
	import IconMdiFlagOutline from '@iconify-svelte/mdi/flag-outline';
	import { IMAGE_REPORT_URL } from '$lib/const';
	import { userInfo } from '$lib/stores/user';

	type PhotoType = { id: string; label: string };

	type Props = {
		sectionType: PhotoType;
		isAdditional?: boolean;

		activeLanguageCode: string;
		currentImages: Array<ProductImage>;
		expandedCategories: Set<string>;
		product: Product;
		photoTypes: Array<{ id: string; label: string }>;
		onToggleExpansion: (type: string) => void;
		onImageEdit?: (imageUrl: string, imageAlt: string) => void;
		onImageUploaded?: (imgId: number) => void;
		onSelectImage?: () => void;
		isSelectingImage?: boolean;
	};

	let {
		sectionType,
		isAdditional,

		activeLanguageCode,
		currentImages,
		expandedCategories,
		product,
		photoTypes,
		onToggleExpansion,
		onImageEdit,
		onImageUploaded,
		onSelectImage,
		isSelectingImage = false
	}: Props = $props();

	const toast = getToastCtx();

	function triggerFileInput(id: string) {
		const input = document.getElementById(id) as HTMLInputElement;
		if (input) input.click();
	}

	async function handleImageUpload(e: Event, imageType: string) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const file = input.files[0];

		// Map type to OpenFoodFacts imagefield value using utility function
		const imagefield = getImageFieldName(imageType, activeLanguageCode, photoTypes);
		const barcode = product.code;

		if ($userInfo == null) {
			toast.warning($_('product.edit.images.toast.login_required'));
			return;
		}

		// Set loading state
		isUploading = true;

		try {
			const base64Data = await fileToBase64(file);
			const uploadResult = await uploadImageV3(fetch, barcode, base64Data, imagefield);

			if (!uploadResult || uploadResult.error || !uploadResult.data) {
				toast.error($_('product.edit.images.toast.upload_failed_generic'));
				return;
			}

			if (uploadResult.data?.status === 'success') {
				if (onImageUploaded) {
					// FIXME: The API response typing is incorrect, so we need to cast here
					// to access the uploaded images
					const uploadedImages = uploadResult.data.product?.images?.uploaded as null | {
						[key: string]: { imgid: number };
					};

					const firstImageKey = uploadedImages ? Object.keys(uploadedImages)[0] : null;
					const imgid =
						firstImageKey && uploadedImages ? uploadedImages[firstImageKey]?.imgid : null;

					if (imgid) {
						toast.success($_('product.edit.images.toast.upload_success'));
						onImageUploaded(imgid);
					} else {
						console.warn('Image upload successful but no valid imgid received:', uploadResult.data);
					}
				}
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
			// Clear loading state
			isUploading = false;
		}

		input.value = '';
	}

	async function handleImageUnselect() {
		const barcode = product.code;

		// Use the type ID directly from the sectionType prop
		const imageType = sectionType.id;

		// Set loading state
		isUnselecting = true;

		try {
			const result = await unselectImageV3(fetch, barcode, imageType, activeLanguageCode);

			if (result.data?.status === 'success' || !result.error) {
				toast.success($_('product.edit.images.toast.unselect_success'));
				await invalidateAll();
			} else {
				console.warn('Image unselect failed:', result);
				toast.error($_('product.edit.images.toast.unselect_failed'));
			}
		} catch (error) {
			console.error('Error unselecting image:', error);
			toast.error($_('product.edit.images.toast.unselect_error'));
		} finally {
			// Clear loading state
			isUnselecting = false;
		}
	}

	// Derived values
	let imagesOfType = $derived(currentImages.filter((img) => img.type === sectionType.label));
	let isExpanded = $derived(expandedCategories.has(sectionType.label));
	let imagesToShow = $derived(isExpanded ? imagesOfType : imagesOfType.slice(0, 10));
	let hasMoreImages = $derived(imagesOfType.length > 10);
	let inputId = $derived(`${sectionType.id}-${activeLanguageCode}-upload`);
	let isStandardType = $derived(!isAdditional);
	let hasImagesOfType = $derived(imagesOfType.length > 0);

	// Loading states
	let isUploading = $state(false);
	let isUnselecting = $state(false);
</script>

<div class="mb-6">
	<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<h4 class="sm:text-md text-sm font-semibold">
			{sectionType.label} picture ({getLanguageName(activeLanguageCode)})
		</h4>
		<div class="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
			<!-- Upload button for this category -->
			<input
				id={inputId}
				type="file"
				accept="image/*"
				class="hidden"
				disabled={isUploading}
				onchange={(e) => handleImageUpload(e, sectionType.label)}
			/>
			<button
				type="button"
				class="btn btn-xs sm:btn-sm btn-outline w-full sm:w-auto"
				class:loading={isUploading}
				disabled={isUploading}
				onclick={() => triggerFileInput(inputId)}
			>
				{#if isUploading}
					<span class="loading loading-spinner h-3 w-3 sm:h-4 sm:w-4"></span>
					<span class="text-xs sm:text-sm"
						>{$_('product.edit.images.uploading', { default: 'Uploading...' })}</span
					>
				{:else}
					<IconMdiUpload class="h-3 w-3 sm:h-4 sm:w-4" />
					<span class="text-xs sm:text-sm"
						>{$_('product.edit.images.upload_type', {
							values: { type: sectionType.label },
							default: 'Upload ' + sectionType.label
						})}</span
					>
				{/if}
			</button>
			{#if isStandardType && hasImagesOfType}
				<button
					type="button"
					class="btn btn-xs sm:btn-sm btn-outline btn-error w-full sm:w-auto"
					class:loading={isUnselecting}
					disabled={isUploading || isUnselecting}
					onclick={() => handleImageUnselect()}
				>
					{#if isUnselecting}
						<span class="loading loading-spinner h-3 w-3 sm:h-4 sm:w-4"></span>
						<span class="text-xs sm:text-sm"
							>{$_('product.edit.images.unselecting', { default: 'Unselecting...' })}</span
						>
					{:else}
						<IconMdiImageRemove class="h-3 w-3 sm:h-4 sm:w-4" />
						<span class="text-xs sm:text-sm"
							>{$_('product.edit.images.unselect_type', {
								values: { type: sectionType.label },
								default: 'Unselect ' + sectionType.label
							})}</span
						>
					{/if}
				</button>
			{/if}
			{#if hasMoreImages}
				<button
					type="button"
					class="btn btn-xs sm:btn-sm btn-outline w-full sm:w-auto"
					disabled={isUploading}
					onclick={() => onToggleExpansion(sectionType.label)}
				>
					<span class="text-xs sm:text-sm"
						>{isExpanded
							? $_('product.edit.images.show_less', { default: 'Show Less' })
							: $_('product.edit.images.see_all', {
									values: { count: imagesOfType.length },
									default: 'See All (' + imagesOfType.length + ')'
								})}</span
					>
				</button>
			{/if}
		</div>
	</div>
	{#if imagesOfType.length > 0}
		<div class="relative">
			<div
				class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
				class:opacity-50={isUploading || isUnselecting}
			>
				{#each imagesToShow as image (image.url)}
					<div>
						<button
							type="button"
							class="group relative aspect-square cursor-pointer overflow-hidden rounded border bg-transparent p-0 transition-shadow hover:shadow-lg"
							disabled={isUploading || isUnselecting}
							onclick={() => onImageEdit?.(image.url, image.alt)}
							title="Click to edit this image"
						>
							<img
								src={image.url}
								alt={image.alt}
								class="h-full w-full object-cover transition-transform group-hover:scale-105"
							/>
							<div
								class="absolute inset-0 flex items-center justify-center bg-transparent transition-colors duration-200 group-hover:bg-black/50"
							>
								<IconMdiPencil
									class="h-6 w-6 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
								/>
							</div>
						</button>
						<div
							class="absolute top-1 right-1 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
						>
							<a
								class="btn btn-circle btn-xs bg-base-100/80 hover:bg-base-100 text-base-content border-none"
								href={IMAGE_REPORT_URL(product.code, image.imgid)}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Report to NutriPatrol"
								title="Report to NutriPatrol"
								onclick={(e) => e.stopPropagation()}
							>
								<IconMdiFlagOutline class="h-3.5 w-3.5" />
							</a>
						</div>

						<p class="text-base-content/70 mt-1 line-clamp-1 text-center text-xs">
							<a href={resolve('/users/[user]', { user: image.uploader })} class="hover:underline">
								{image.uploader}
							</a>
						</p>
						<p class="text-base-content/50 mt-0.5 line-clamp-1 text-center text-xs">
							{getDateFormatter({
								dateStyle: 'medium',
								timeStyle: 'medium'
							}).format(new Date(image.uploaded_t * 1000))}
						</p>
					</div>
				{/each}
			</div>

			<!-- Upload/Unselect loading overlay -->
			{#if isUploading || isUnselecting}
				<div
					class="bg-base-100/80 absolute inset-0 flex items-center justify-center rounded backdrop-blur-sm"
				>
					<div class="text-center">
						<div class="loading loading-spinner loading-lg text-primary"></div>
						<p class="text-base-content/70 mt-2 text-sm">
							{isUploading
								? $_('product.edit.images.processing_upload', { default: 'Processing upload...' })
								: $_('product.edit.images.unselecting_image', { default: 'Unselecting image...' })}
						</p>
					</div>
				</div>
			{:else}
				<p class="text-base-content/60 text-center text-xs sm:text-sm">
					No {sectionType.label.toLowerCase()}
					{$_('product.edit.images.photos_available', { default: 'photos available' })}
				</p>
				<button
					type="button"
					class="btn btn-xs sm:btn-sm btn-outline w-full sm:w-auto"
					class:loading={isSelectingImage}
					disabled={isSelectingImage}
					onclick={() => onSelectImage?.()}
				>
					{#if isSelectingImage}
						<span class="loading loading-spinner h-3 w-3 sm:h-4 sm:w-4"></span>
						<span class="text-xs sm:text-sm"
							>{$_('product.edit.images.selecting', { default: 'Selecting...' })}</span
						>
					{:else}
						<IconMdiImagePlus class="h-3 w-3 sm:h-4 sm:w-4" />
						<span class="text-xs sm:text-sm"
							>{$_('product.edit.images.select_type', {
								values: { type: sectionType.label },
								default: 'Select ' + sectionType.label
							})}</span
						>
					{/if}
				</button>
			{/if}
		</div>
	{/if}
</div>
