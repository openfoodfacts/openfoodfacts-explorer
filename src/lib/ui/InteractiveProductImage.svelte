<script lang="ts">
	import { IMAGE_REPORT_URL } from '$lib/const';
	import ImageModal from './ImageModal.svelte';
	import IconMdiFlagOutline from '@iconify-svelte/mdi/flag-outline';

	type Props = { src?: string; alt?: string; imageid?: number; productCode?: string };
	let { src, alt, imageid, productCode }: Props = $props();

	let modal: ImageModal;

	function getFullSizeImageUrl(url: string): string {
		return url.replace(/\.400\.|\.200\.|\.100\./, '.full.');
	}

	// Extract image ID from URL if not provided
	let derivedImageId = $derived.by(() => {
		if (imageid != null) return imageid;
		if (src == null) return undefined;
		const match = src.match(/\/(\d+)\.(full|400|200|100)\.jpg/);
		return match ? parseInt(match[1]) : undefined;
	});

	let onclick = $derived.by(() => {
		if (src == null) {
			return undefined;
		}
		return () => modal.displayImage(getFullSizeImageUrl(src), alt, derivedImageId, productCode);
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

	{#if derivedImageId && productCode}
		<div class="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
			<a
				class="btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100"
				href={IMAGE_REPORT_URL(productCode, derivedImageId)}
				target="_blank"
				rel="noopener"
				aria-label="Report to NutriPatrol"
				title="Report to NutriPatrol"
				onclick={(e) => e.stopPropagation()}
			>
				<IconMdiFlagOutline class="h-4 w-4" />
			</a>
		</div>
	{/if}
</div>
