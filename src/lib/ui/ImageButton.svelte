<script lang="ts">
	import ImageModal from './ImageModal.svelte';

	type Props = { src?: string; alt?: string; imageid?: number; productCode?: string };
	let { src, alt, imageid, productCode }: Props = $props();

	let modal: ImageModal;

	function getFullSizeImageUrl(url: string): string {
		return url.replace(/\.400\.|\.200\.|\.100\./, '.full.');
	}

	let onclick = $derived.by(() => {
		if (src == null) {
			return undefined;
		}
		return () => modal.displayImage(getFullSizeImageUrl(src), alt, imageid, productCode);
	});
</script>

<ImageModal bind:this={modal} />

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
