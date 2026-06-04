<script lang="ts">
	import ImageModal from './ImageModal.svelte';
	import IconMdiFlagOutline from '@iconify-svelte/mdi/flag-outline';
	import { openNutriPatrolFlag } from '$lib/stores/nutripatrol';
	import { userInfo } from '$lib/stores/user';
	import { getToastCtx } from '$lib/stores/toasts';
	import { _ } from 'svelte-i18n';

	import { getContext } from 'svelte';

	type Props = { src?: string; alt?: string; rawImageId?: number; productCode?: string };
	let { src, alt, rawImageId, productCode }: Props = $props();

	let modal: ImageModal;

	const toast = getToastCtx();
	const getProductImages =
		getContext<() => Record<string, { imgid?: string | number }> | undefined>('product-images');

	function getFullSizeImageUrl(url: string): string {
		return url.replace(/\.400\.|\.200\.|\.100\./, '.full.');
	}

	// Extract image ID from URL if not provided
	let imageId = $derived.by(() => {
		if (rawImageId != null) return rawImageId;
		if (src == null) return undefined;

		// Extract raw numeric ID directly (e.g. 1.jpg)
		const numericMatch = src.match(/\/(\d+)\.(full|400|200|100)?\.(jpg|png|webp)/i);
		if (numericMatch) return parseInt(numericMatch[1], 10);

		// Extract selected image key (e.g. front_en, ingredients_fr) and lookup using product-images context
		const keyMatch = src.match(
			/\/([a-zA-Z_]+)(?:\.\d+)?(?:\.(full|400|200|100))?\.(jpg|jpeg|png|webp)/i
		);
		if (keyMatch && getProductImages) {
			const images = getProductImages();
			const imageKey = keyMatch[1];
			const imgid = images?.[imageKey]?.imgid;
			if (imgid) return parseInt(imgid.toString(), 10);
		}

		return undefined;
	});

	let onclick = $derived.by(() => {
		if (src == null) {
			return undefined;
		}
		return () => modal.displayImage(getFullSizeImageUrl(src), alt, imageId, productCode);
	});
</script>

<ImageModal bind:this={modal} />

<div class="group relative flex items-center justify-center">
	<button class="flex cursor-pointer items-center justify-center" {onclick}>
		{#if src != null}
			<div class="flex items-center justify-center">
				<img {src} {alt} class="max-h-full max-w-full cursor-pointer rounded-lg object-contain" />
			</div>
		{:else}
			<div
				class="mt-4 flex min-h-[120px] min-w-[120px] items-center justify-center rounded-lg bg-gray-200"
			>
				<img src="/Placeholder.svg" alt="Image not available" height="24" aria-hidden="true" />
			</div>
		{/if}
	</button>

	{#if imageId && productCode}
		<div class="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
			<button
				type="button"
				class="btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100"
				aria-label={$_('product.edit.images.report_to_moderators', {
					default: 'Report image to our moderators'
				})}
				title={$_('product.edit.images.report_to_moderators', {
					default: 'Report image to our moderators'
				})}
				onclick={(e) => {
					e.stopPropagation();
					if ($userInfo == null) {
						toast.warning(
							$_('product.edit.images.toast.report_login_required', {
								default: 'Please log in to report an image.'
							})
						);
						return;
					}
					if (src) {
						openNutriPatrolFlag({
							barcode: productCode,
							imageId: imageId.toString(),
							url: src
						});
					}
				}}
			>
				<IconMdiFlagOutline class="h-4 w-4" />
			</button>
		</div>
	{/if}
</div>
