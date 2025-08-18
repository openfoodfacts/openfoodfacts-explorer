<script lang="ts">
	import ISO6391 from 'iso-639-1';
	import { getImageFieldName } from '$lib/utils';
	import { ProductsApi } from '$lib/api';
	import { preferences } from '$lib/settings';
	import type { Product } from '$lib/api';
	import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs';
	import type { UploadResult } from './PhotoManager.svelte';

	type PhotoType = {
		id: string;
		label: string;
		isAdditional?: boolean;
	};

	type Props = {
		photoType: PhotoType;
		activeLanguageCode: string;
		currentImages: Array<{ url: string; alt: string; type: string }>;
		expandedCategories: Set<string>;
		product: Product;
		photoTypes: Array<{ id: string; label: string }>;
		onToggleExpansion: (type: string) => void;
		onImageEdit?: (imageUrl: string, imageAlt: string) => void;
		onImageUploaded?: (uploadResult?: {
			type: string;
			imagefield: string;
			result: UploadResult;
		}) => void;
	};

	let {
		photoType,
		activeLanguageCode,
		currentImages,
		expandedCategories,
		product,
		photoTypes,
		onToggleExpansion,
		onImageEdit,
		onImageUploaded
	}: Props = $props();

	function getLanguage(code: string) {
		return ISO6391.getName(code);
	}

	function triggerFileInput(id: string) {
		const input = document.getElementById(id) as HTMLInputElement;
		if (input) input.click();
	}

	async function handleImageUpload(e: Event, type: string) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const file = input.files[0];

		// Map type to OpenFoodFacts imagefield value using utility function
		const imagefield = getImageFieldName(type, activeLanguageCode, photoTypes);

		const barcode = product.code;
		const user_id = $preferences.username;
		const password = $preferences.password;

		if (!user_id || !password) {
			alert('Please set your OpenFoodFacts username and password in settings.');
			return;
		}

		// Set loading state
		isUploading = true;

		try {
			const api = new ProductsApi(fetch);
			const uploadResult = await api.uploadImage(barcode, file, imagefield);

			// Check if upload was successful based on status field
			if (uploadResult.status === 'status ok') {
				if (onImageUploaded) {
					onImageUploaded({
						type: photoType.label,
						imagefield: imagefield,
						result: uploadResult
					});
				}
			} else {
				alert(`Upload failed: ${uploadResult.error || 'Unknown error'}`);
			}
		} catch (err) {
			console.error('Image upload failed:', err);
			alert('Image upload failed. Please try again.');
		} finally {
			// Clear loading state
			isUploading = false;
		}

		input.value = '';
	}

	async function handleImageUnselect(type: string) {
		const barcode = product.code;
		const imagefield = getImageFieldName(type, activeLanguageCode, photoTypes);

		try {
			const off = new OpenFoodFacts(fetch);
			const result = await off.unselectImage(barcode, imagefield);
			console.log(result);

			if (result.status === 'success' || result.status_code === 200) {
				console.log('Image unselected successfully:', result);
			} else {
				console.warn('Image unselect failed:', result);
			}
		} catch (error) {
			console.error('Error unselecting image:', error);
			alert('Error unselecting image. Please try again.');
		}
	}

	// Derived values
	const imagesOfType = $derived(currentImages.filter((img) => img.type === photoType.label));
	const isExpanded = $derived(expandedCategories.has(photoType.label));
	const imagesToShow = $derived(isExpanded ? imagesOfType : imagesOfType.slice(0, 10));
	const hasMoreImages = $derived(imagesOfType.length > 10);
	const inputId = $derived(`${photoType.id}-${activeLanguageCode}-upload`);
	const isStandardType = $derived(!photoType.isAdditional);
	const hasImagesOfType = $derived(imagesOfType.length > 0);

	// Loading state for image upload
	let isUploading = $state(false);
</script>

<div class="mb-6">
	<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<h4 class="sm:text-md text-sm font-semibold">
			{photoType.label} picture ({getLanguage(activeLanguageCode)})
		</h4>
		<div class="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
			<!-- Upload button for this category -->
			<input
				id={inputId}
				type="file"
				accept="image/*"
				class="hidden"
				disabled={isUploading}
				onchange={(e) => handleImageUpload(e, photoType.label)}
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
					<span class="text-xs sm:text-sm">Upload {photoType.label}</span>
				{/if}
			</button>
			{#if isStandardType && hasImagesOfType}
				<button
					type="button"
					class="btn btn-xs sm:btn-sm btn-outline btn-error w-full sm:w-auto"
					disabled={isUploading}
					onclick={() => handleImageUnselect(photoType.label)}
				>
					<span class="icon-[mdi--image-remove] h-3 w-3 sm:h-4 sm:w-4"></span>
					<span class="text-xs sm:text-sm">Unselect {photoType.label}</span>
				</button>
			{/if}
			{#if hasMoreImages}
				<button
					type="button"
					class="btn btn-xs sm:btn-sm btn-outline w-full sm:w-auto"
					disabled={isUploading}
					onclick={() => onToggleExpansion(photoType.label)}
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
				class:opacity-50={isUploading}
			>
				{#each imagesToShow as image (image.url)}
					<button
						type="button"
						class="group relative aspect-square cursor-pointer overflow-hidden rounded border bg-transparent p-0 transition-shadow hover:shadow-lg"
						disabled={isUploading}
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

			<!-- Upload loading overlay -->
			{#if isUploading}
				<div
					class="bg-base-100/80 absolute inset-0 flex items-center justify-center rounded backdrop-blur-sm"
				>
					<div class="text-center">
						<div class="loading loading-spinner loading-lg text-primary"></div>
						<p class="text-base-content/70 mt-2 text-sm">Processing upload...</p>
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="bg-base-200 relative flex w-full items-center justify-center rounded p-3 sm:p-4">
			{#if isUploading}
				<div class="text-center">
					<div class="loading loading-spinner loading-lg text-primary"></div>
					<p class="text-base-content/70 mt-2 text-center text-xs sm:text-sm">
						Uploading {photoType.label.toLowerCase()} photo...
					</p>
				</div>
			{:else}
				<p class="text-base-content/60 text-center text-xs sm:text-sm">
					No {photoType.label.toLowerCase()} photos available
				</p>
			{/if}
		</div>
	{/if}
</div>
