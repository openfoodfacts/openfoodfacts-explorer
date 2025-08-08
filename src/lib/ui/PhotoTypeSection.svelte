<script lang="ts">
	import ISO6391 from 'iso-639-1';
	import { getImageFieldName } from '$lib/utils';
	import { ProductsApi } from '$lib/api';
	import { preferences } from '$lib/settings';
	import type { Product } from '$lib/api';

	type PhotoType =
		| { id: string; label: string }
		| { id: string; label: string; isAdditional?: boolean };

	type Props = {
		photoType: PhotoType;
		activeLanguageCode: string;
		currentImages: Array<{ url: string; alt: string; type: string }>;
		expandedCategories: Set<string>;
		fileInputValues: Record<string, string>;
		product: Product;
		photoTypes: Array<{ id: string; label: string }>;
		onToggleExpansion: (type: string) => void;
		onFileInputChange: (key: string, value: string) => void;
		onImageEdit?: (imageUrl: string, imageAlt: string) => void;
	};

	let {
		photoType,
		activeLanguageCode,
		currentImages,
		expandedCategories,
		fileInputValues,
		product,
		photoTypes,
		onToggleExpansion,
		onFileInputChange,
		onImageEdit
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

		try {
			const api = new ProductsApi(fetch);
			await api.uploadImage(barcode, file, imagefield);

			// TODO: show notification of success and remove alert
			alert('Image uploaded successfully!');
			// Reload the page to show the new image
			window.location.reload();
		} catch (err) {
			console.error('Image upload failed:', err);
			alert('Image upload failed. Please try again.');
		}

		const inputKey = `${type}-${activeLanguageCode}`;
		onFileInputChange(inputKey, '');
	}

	// Derived values
	const imagesOfType = $derived(currentImages.filter((img) => img.type === photoType.label));
	const isExpanded = $derived(expandedCategories.has(photoType.label));
	const imagesToShow = $derived(isExpanded ? imagesOfType : imagesOfType.slice(0, 10));
	const hasMoreImages = $derived(imagesOfType.length > 10);
	const inputId = $derived(`${photoType.id}-${activeLanguageCode}-upload`);
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
				bind:value={fileInputValues[`${photoType.label}-${activeLanguageCode}`]}
				onchange={(e) => handleImageUpload(e, photoType.label)}
			/>
			<button
				type="button"
				class="btn btn-xs sm:btn-sm btn-outline w-full sm:w-auto"
				onclick={() => triggerFileInput(inputId)}
			>
				<span class="icon-[mdi--upload] h-3 w-3 sm:h-4 sm:w-4"></span>
				<span class="text-xs sm:text-sm">Upload {photoType.label}</span>
			</button>
			{#if hasMoreImages}
				<button
					type="button"
					class="btn btn-xs sm:btn-sm btn-outline w-full sm:w-auto"
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
		<div
			class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
		>
			{#each imagesToShow as image (image.url)}
				<button
					type="button"
					class="group relative aspect-square cursor-pointer overflow-hidden rounded border bg-transparent p-0 transition-shadow hover:shadow-lg"
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
	{:else}
		<div class="bg-base-200 flex w-full items-center justify-center rounded p-3 sm:p-4">
			<p class="text-base-content/60 text-center text-xs sm:text-sm">
				No {photoType.label.toLowerCase()} photos available
			</p>
		</div>
	{/if}
</div>
