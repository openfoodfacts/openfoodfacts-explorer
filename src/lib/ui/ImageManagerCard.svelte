<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product, RawImage } from '$lib/api';
	import { getProductImageUrl, moveImages } from '$lib/api/product';
	import { getToastCtx } from '$lib/stores/toasts';
	import IconMdiImageMove from '@iconify-svelte/mdi/image-move';
	import { SvelteSet } from 'svelte/reactivity';

	let { product }: { product: Product } = $props();
	const toast = getToastCtx();

	let selectedImgIds = new SvelteSet<number>();
	let targetBarcode = $state('');
	let copyData = $state(false);
	let isSubmitting = $state(false);

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

		try {
			const { data, error } = await moveImages(fetch, product.code, imgidsStr, barcode, copyData);
			if (error) {
				toast.error(
					$_('product.moderator.image_manager_move_error', {
						default: 'Failed to move images. Please try again.'
					}) +
						': ' +
						error
				);
			} else if (data) {
				toast.success(
					$_('product.moderator.image_manager_move_success', {
						default: 'Images moved successfully.',
						values: { code: barcode }
					})
				);
				selectedImgIds.clear();
				targetBarcode = '';
				copyData = false;
				const { invalidateAll } = await import('$app/navigation');
				await invalidateAll();
			}
		} catch (err) {
			console.error('Error in handleMove:', err);
			toast.error(
				$_('product.moderator.image_manager_move_error', {
					default: 'Failed to move images. Please try again.'
				})
			);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="flex flex-col gap-4 p-2">
	<div class="flex items-center gap-2">
		<IconMdiImageMove class="text-warning h-5 w-5" />
		<h2 class="text-lg font-bold">{$_('product.moderator.image_manager_title')}</h2>
	</div>

	<p class="text-base-content/70 text-sm">
		{$_('product.moderator.image_manager_description')}
	</p>

	{#if rawImages.length === 0}
		<div class="bg-base-300 flex items-center justify-center rounded-lg p-6 text-center">
			<p class="text-base-content/50 text-sm">
				{$_('product.moderator.image_manager_no_images')}
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
					Select All
				</button>
				<button
					type="button"
					class="btn btn-xs btn-outline"
					onclick={() => selectedImgIds.clear()}
					disabled={isSubmitting || selectedImgIds.size === 0}
				>
					Clear
				</button>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each rawImages as img (img.imgid)}
				<button
					type="button"
					class="relative aspect-square overflow-hidden rounded-lg border-2 bg-base-300 transition-all focus:outline-none focus:ring-2 focus:ring-warning cursor-pointer {selectedImgIds.has(
						img.imgid
					)
						? 'border-warning'
						: 'border-base-content/10'}"
					onclick={() => toggleSelect(img.imgid)}
					disabled={isSubmitting}
				>
					<img src={img.url} alt="Uploaded img {img.imgid}" class="h-full w-full object-cover" />

					{#if selectedImgIds.has(img.imgid)}
						<div class="absolute inset-0 bg-warning/20 flex items-center justify-center">
							<div class="bg-warning text-warning-content rounded-full p-1 shadow-md">
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
						class="absolute bottom-0 inset-x-0 bg-black/70 p-1.5 text-left text-[10px] text-white opacity-0 transition-opacity hover:opacity-100 flex flex-col gap-0.5"
					>
						<span class="truncate">
							{$_('product.moderator.image_manager_uploaded_by', {
								values: { uploader: img.uploader }
							})}
						</span>
						<span>
							{$_('product.moderator.image_manager_uploaded_at', {
								values: { date: formatDate(img.uploaded_t) }
							})}
						</span>
					</div>
				</button>
			{/each}
		</div>

		<div class="flex flex-col gap-2 sm:flex-row sm:items-end mt-4">
			<label class="input w-full">
				<span class="label">{$_('product.moderator.image_manager_move_target_label')}</span>
				<input
					type="text"
					bind:value={targetBarcode}
					placeholder={$_('product.moderator.image_manager_move_target_placeholder')}
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
				{$_('product.moderator.image_manager_move_btn')}
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
					{$_('product.moderator.image_manager_copy_data_label')}
				</span>
			</label>
		</div>
	{/if}
</div>
