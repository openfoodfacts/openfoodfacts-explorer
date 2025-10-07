<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	import { getImageFieldName } from '$lib/utils';
	import { ProductsApi, fileToBase64 } from '$lib/api';
	import { preferences } from '$lib/settings';
	import type { Product } from '$lib/api';
	import { getToastCtx } from '$lib/stores/toasts';
	import { getLanguageName } from '$lib/languages';

	type PhotoType = { id: string; label: string };

	type Props = {
		sectionType: PhotoType;
		isAdditional?: boolean;

		activeLanguageCode: string;
		currentImages: Array<{ url: string; alt: string; type: string }>;
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
		const user_id = $preferences.username;
		const password = $preferences.password;

		if (!user_id || !password) {
			toast.warning('Please set your OpenFoodFacts username and password in settings.');
			return;
		}

		// Set loading state
		isUploading = true;

		try {
			const api = new ProductsApi(fetch);

			const base64Data = await fileToBase64(file);

			const uploadResult = await api.uploadImageV3(barcode, base64Data, imagefield);

			if (!uploadResult || uploadResult.error || !uploadResult.data) {
				toast.error(`Upload failed: ${uploadResult}`);
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
						toast.success('Image uploaded successfully!');
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
				toast.error(`Upload failed: ${errorMessages}`);
			}
		} catch (err) {
			console.error('Image upload failed:', err);
			toast.error('Image upload failed. Please try again.');
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
			const api = new ProductsApi(fetch);
			const result = await api.unselectImageV3(barcode, imageType, activeLanguageCode);

			if (result.data?.status === 'success' || !result.error) {
				toast.success('Image unselected successfully');
				await invalidateAll();
			} else {
				console.warn('Image unselect failed:', result);
				toast.error('Failed to unselect image. Please try again.');
			}
		} catch (error) {
			console.error('Error unselecting image:', error);
			toast.error('Error unselecting image. Please try again.');
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
					<span class="text-xs sm:text-sm">Uploading...</span>
				{:else}
					<span class="icon-[mdi--upload] h-3 w-3 sm:h-4 sm:w-4"></span>
					<span class="text-xs sm:text-sm">Upload {sectionType.label}</span>
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
						<span class="text-xs sm:text-sm">Unselecting...</span>
					{:else}
						<span class="icon-[mdi--image-remove] h-3 w-3 sm:h-4 sm:w-4"></span>
						<span class="text-xs sm:text-sm">Unselect {sectionType.label}</span>
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
						>{isExpanded ? 'Show Less' : `See All (${imagesOfType.length})`}</span
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
							<span
								class="icon-[mdi--pencil] h-6 w-6 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
							></span>
						</div>
					</button>
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
							{isUploading ? 'Processing upload...' : 'Unselecting image...'}
						</p>
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div
			class="bg-base-200 relative flex w-full flex-col items-center justify-center gap-2 rounded p-3 sm:p-4"
			class:opacity-50={isSelectingImage}
		>
			{#if isUploading}
				<div class="text-center">
					<div class="loading loading-spinner loading-lg text-primary"></div>
					<p class="text-base-content/70 mt-2 text-center text-xs sm:text-sm">
						Uploading {sectionType.label.toLowerCase()} photo...
					</p>
				</div>
			{:else if isSelectingImage}
				<div class="text-center">
					<div class="loading loading-spinner loading-lg text-primary"></div>
					<p class="text-base-content/70 mt-2 text-center text-xs sm:text-sm">
						Selecting {sectionType.label.toLowerCase()} photo...
					</p>
				</div>
			{:else}
				<p class="text-base-content/60 text-center text-xs sm:text-sm">
					No {sectionType.label.toLowerCase()} photos available
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
						<span class="text-xs sm:text-sm">Selecting...</span>
					{:else}
						<span class="icon-[mdi--image-plus] h-3 w-3 sm:h-4 sm:w-4"></span>
						<span class="text-xs sm:text-sm">Select {sectionType.label}</span>
					{/if}
				</button>
			{/if}
		</div>
	{/if}
</div>
