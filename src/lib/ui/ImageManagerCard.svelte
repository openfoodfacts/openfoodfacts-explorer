<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product, RawImage } from '$lib/api';
	import { getProductImageUrl, moveImages, deleteImages } from '$lib/api/product';
	import { getToastCtx } from '$lib/stores/toasts';
	import IconMdiImageMove from '@iconify-svelte/mdi/image-move';
	import IconMdiImageRemove from '@iconify-svelte/mdi/image-remove';
	import IconMdiImageMultiple from '@iconify-svelte/mdi/image-multiple';
	import IconMdiEye from '@iconify-svelte/mdi/eye';
	import ImageModal from './ImageModal.svelte';
	import { SvelteSet } from 'svelte/reactivity';

	let { product }: { product: Product } = $props();
	const toast = getToastCtx();

	let activeTab = $state<'move' | 'delete'>('move');
	let selectedImgIds = new SvelteSet<number>();
	let targetBarcode = $state('');
	let copyData = $state(false);
	let deleteConfirm = $state(false);
	let isSubmitting = $state(false);
	let modal: ImageModal;

	function getFullSizeImageUrl(url: string, imgid: number): string {
		const lastSlash = url.lastIndexOf('/');
		if (lastSlash === -1) return url;
		return url.substring(0, lastSlash + 1) + `${imgid}.jpg`;
	}

	function openPreview(img: {
		url: string | null;
		imgid: number;
		uploader: string;
		uploaded_t: number;
	}) {
		if (!img.url) return;
		const fullUrl = getFullSizeImageUrl(img.url, img.imgid);
		modal.displayImage(
			fullUrl,
			`Uploaded by ${img.uploader} on ${formatDate(img.uploaded_t)}`,
			img.imgid,
			product.code
		);
	}

	// Extract numeric raw images from product.images
	let rawImages = $derived.by(() => {
		const imagesObj = product.images || {};
		const numericKeys = Object.keys(imagesObj).filter((key) => /^\d+$/.test(key));
		return numericKeys
			.map((key) => {
				const imgObj = imagesObj[key] as RawImage;
				const url = getProductImageUrl(product.code, key, imagesObj);
				return {
					imgid: parseInt(key, 10),
					url,
					uploaded_t: imgObj?.uploaded_t || 0,
					uploader: imgObj?.uploader || 'unknown'
				};
			})
			.filter((img) => img.url !== null)
			.sort((a, b) => b.uploaded_t - a.uploaded_t); // show newest first
	});

	function toggleSelect(imgid: number) {
		if (selectedImgIds.has(imgid)) {
			selectedImgIds.delete(imgid);
		} else {
			selectedImgIds.add(imgid);
		}
	}

	function formatDate(timestamp: number) {
		if (!timestamp) return 'unknown';
		return new Date(timestamp * 1000).toLocaleDateString(undefined, {
			dateStyle: 'medium'
		});
	}

	async function handleMove() {
		const barcode = targetBarcode.trim();
		if (!barcode) return;
		if (selectedImgIds.size === 0) {
			toast.error(
				$_('product.moderator.image_manager_select_first', {
					default: 'Please select at least one image first.'
				})
			);
			return;
		}

		isSubmitting = true;
		const imgidsStr = Array.from(selectedImgIds).join(',');

		const { data, error } = await moveImages(fetch, product.code, imgidsStr, barcode, copyData);
		if (error) {
			toast.error(
				$_('product.moderator.image_manager_move_error', {
					default: 'Failed to move images: {error}',
					values: { error }
				})
			);
		} else if (data) {
			toast.success(
				$_('product.moderator.image_manager_move_success', {
					default: 'Images moved successfully to {code}.',
					values: { code: barcode }
				})
			);
			selectedImgIds.clear();
			targetBarcode = '';
			copyData = false;
			const { invalidateAll } = await import('$app/navigation');
			await invalidateAll();
		}
		isSubmitting = false;
	}

	async function handleDelete() {
		if (selectedImgIds.size === 0) {
			toast.error(
				$_('product.moderator.image_manager_select_first', {
					default: 'Please select at least one image first.'
				})
			);
			return;
		}
		if (!deleteConfirm) return;

		isSubmitting = true;
		const imgidsStr = Array.from(selectedImgIds).join(',');

		const { data, error } = await deleteImages(fetch, product.code, imgidsStr);

		if (error) {
			toast.error(
				$_('product.moderator.image_manager_delete_error', {
					default: 'Failed to delete images: {error}',
					values: { error }
				})
			);
		} else if (data) {
			toast.success(
				$_('product.moderator.image_manager_delete_success', {
					default: 'Images deleted successfully.'
				})
			);
			selectedImgIds.clear();
			deleteConfirm = false;
			const { invalidateAll } = await import('$app/navigation');
			await invalidateAll();
		}
		isSubmitting = false;
	}
</script>

<div class="flex flex-col gap-4 p-2">
	<div class="flex items-center gap-2">
		<IconMdiImageMultiple class="text-warning h-5 w-5" />
		<h2 class="text-lg font-bold">
			{$_('product.moderator.image_manager_title', { default: 'Image Manager' })}
		</h2>
	</div>

	<p class="text-base-content/70 text-sm">
		{$_('product.moderator.image_manager_description', {
			default: 'You can select one or more images and then:'
		})}
	</p>

	<div class="tabs tabs-boxed gap-1 bg-base-300 p-0.5 rounded-lg flex w-full">
		<button
			type="button"
			class="tab tab-xs sm:tab-sm transition-all rounded-md flex-1 px-2 py-1.5 sm:px-4 gap-1.5 {activeTab ===
			'move'
				? 'tab-active bg-warning text-warning-content font-bold'
				: 'text-base-content/70 hover:text-base-content'}"
			onclick={() => {
				activeTab = 'move';
			}}
			disabled={isSubmitting}
		>
			<IconMdiImageMove class="h-4 w-4 shrink-0" />
			<span class="text-xs text-left truncate sm:overflow-visible sm:whitespace-normal">
				{$_('product.moderator.image_manager_tab_move', { default: 'Move' })}
			</span>
		</button>
		<button
			type="button"
			class="tab tab-xs sm:tab-sm transition-all rounded-md flex-1 px-2 py-1.5 sm:px-4 gap-1.5 {activeTab ===
			'delete'
				? 'tab-active bg-error text-error-content font-bold'
				: 'text-base-content/70 hover:text-base-content'}"
			onclick={() => {
				activeTab = 'delete';
			}}
			disabled={isSubmitting}
		>
			<IconMdiImageRemove class="h-4 w-4 shrink-0" />
			<span class="text-xs text-left truncate sm:overflow-visible sm:whitespace-normal">
				{$_('product.moderator.image_manager_tab_delete', { default: 'Delete' })}
			</span>
		</button>
	</div>

	{#if rawImages.length === 0}
		<div class="bg-base-300 flex items-center justify-center rounded-lg p-6 text-center">
			<p class="text-base-content/50 text-sm">
				{$_('product.moderator.image_manager_no_images', {
					default: 'No uploaded images found for this product.'
				})}
			</p>
		</div>
	{:else}
		<div class="flex items-center justify-between">
			<span class="text-base-content/60 text-xs font-medium">
				{selectedImgIds.size} / {rawImages.length} selected
			</span>
			<div class="flex gap-2">
				<button
					type="button"
					class="btn btn-xs btn-outline"
					onclick={() => {
						selectedImgIds.clear();
						rawImages.forEach((img) => selectedImgIds.add(img.imgid));
					}}
					disabled={isSubmitting}
				>
					{$_('product.moderator.image_manager_select_all', { default: 'Select All' })}
				</button>
				<button
					type="button"
					class="btn btn-xs btn-outline"
					onclick={() => selectedImgIds.clear()}
					disabled={isSubmitting || selectedImgIds.size === 0}
				>
					{$_('product.moderator.image_manager_clear', { default: 'Clear' })}
				</button>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each rawImages as img (img.imgid)}
				<div class="group relative aspect-square">
					<button
						type="button"
						aria-pressed={selectedImgIds.has(img.imgid)}
						aria-label={$_('product.moderator.image_manager_select_image', {
							default: 'Select image {imgid}',
							values: { imgid: img.imgid }
						})}
						class="h-full w-full overflow-hidden rounded-lg border-2 bg-base-300 transition-all focus:outline-none focus:ring-2 cursor-pointer {selectedImgIds.has(
							img.imgid
						)
							? activeTab === 'move'
								? 'border-warning focus:ring-warning'
								: 'border-error focus:ring-error'
							: 'border-base-content/10 ' +
								(activeTab === 'move' ? 'focus:ring-warning' : 'focus:ring-error')}"
						onclick={() => toggleSelect(img.imgid)}
						disabled={isSubmitting}
					>
						<img src={img.url} alt="Uploaded img {img.imgid}" class="h-full w-full object-cover" />

						{#if selectedImgIds.has(img.imgid)}
							<div
								class="absolute inset-0 flex items-center justify-center {activeTab === 'move'
									? 'bg-warning/20'
									: 'bg-error/20'}"
							>
								<div
									class="rounded-full p-1 shadow-md {activeTab === 'move'
										? 'bg-warning text-warning-content'
										: 'bg-error text-error-content'}"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="3"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								</div>
							</div>
						{/if}

						<div
							class="absolute bottom-0 inset-x-0 bg-neutral/70 p-1.5 text-left text-xs text-neutral-content opacity-0 transition-opacity hover:opacity-100 flex flex-col gap-0.5"
						>
							<span class="truncate">
								{$_('product.moderator.image_manager_uploaded_by', {
									default: 'Uploaded by {uploader}',
									values: { uploader: img.uploader }
								})}
							</span>
							<span>
								{$_('product.moderator.image_manager_uploaded_at', {
									default: 'Uploaded on {date}',
									values: { date: formatDate(img.uploaded_t) }
								})}
							</span>
						</div>
					</button>

					<!-- Hover Preview Eye Icon -->
					<button
						type="button"
						class="absolute top-2 left-2 z-25 btn btn-circle btn-xs bg-base-100/80 hover:bg-base-100 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm"
						onclick={() => openPreview(img)}
						aria-label={$_('product.moderator.image_manager_preview_label', {
							default: 'Preview image'
						})}
						title={$_('product.moderator.image_manager_preview_label', {
							default: 'Preview image'
						})}
						disabled={isSubmitting}
					>
						<IconMdiEye class="h-3.5 w-3.5" />
					</button>
				</div>
			{/each}
		</div>

		{#if activeTab === 'move'}
			<div class="flex flex-col gap-2 sm:flex-row sm:items-end mt-4">
				<label class="input w-full">
					<span class="label"
						>{$_('product.moderator.image_manager_move_target_label', {
							default: 'Destination Barcode'
						})}</span
					>
					<input
						type="text"
						bind:value={targetBarcode}
						placeholder={$_('product.moderator.image_manager_move_target_placeholder', {
							default: 'Enter barcode (e.g. 3017620422003)'
						})}
						disabled={isSubmitting}
					/>
				</label>

				<button
					class="btn btn-warning btn-sm sm:btn-md w-full sm:w-auto shrink-0"
					onclick={handleMove}
					disabled={isSubmitting || selectedImgIds.size === 0 || !targetBarcode.trim()}
					type="button"
				>
					{#if isSubmitting}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					{$_('product.moderator.image_manager_move_btn', {
						default: 'Move the images to another product'
					})}
				</button>
			</div>

			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-3">
					<input
						type="checkbox"
						class="checkbox checkbox-warning checkbox-sm"
						bind:checked={copyData}
						disabled={isSubmitting}
					/>
					<span class="label-text text-sm text-base-content/80">
						{$_('product.moderator.image_manager_copy_data_label', {
							default: 'Copy data from current product to new product'
						})}
					</span>
				</label>
			</div>
		{:else}
			<div class="alert alert-error text-sm mt-4 flex items-start gap-2 shadow-sm">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 shrink-0 text-error-content"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<span class="text-error-content font-medium">
					<strong class="font-bold">
						{$_('product.moderator.image_manager_delete_warning_prefix', { default: 'Warning:' })}
					</strong>
					{$_('product.moderator.image_manager_delete_warning_body', {
						default: ' Deleting raw images is permanent and cannot be undone.'
					})}
				</span>
			</div>

			<div class="flex flex-col gap-4 mt-2">
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-3">
						<input
							type="checkbox"
							class="checkbox checkbox-error checkbox-sm"
							bind:checked={deleteConfirm}
							disabled={isSubmitting}
						/>
						<span class="label-text text-sm text-base-content/80">
							{$_('product.moderator.image_manager_delete_confirm_label', {
								default: 'Yes, I confirm I want to permanently delete these images.'
							})}
						</span>
					</label>
				</div>

				<button
					class="btn btn-error btn-sm sm:btn-md w-full sm:w-auto self-start"
					onclick={handleDelete}
					disabled={isSubmitting || selectedImgIds.size === 0 || !deleteConfirm}
					type="button"
				>
					{#if isSubmitting}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					{$_('product.moderator.image_manager_delete_btn', {
						default: 'Delete the selected images'
					})}
				</button>
			</div>
		{/if}
	{/if}
</div>

<ImageModal bind:this={modal} />
