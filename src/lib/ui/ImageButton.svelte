<script lang="ts">
	import ImageModal from './ImageModal.svelte';

	type Props = { src?: string; alt?: string };
	let { src, alt }: Props = $props();

	let modal: ImageModal;

	function getFullSizeImageUrl(url: string): string {
		return url.replace(/\.400\.|\.200\.|\.100\./, '.full.');
	}
	let onclick = $derived(
		src != null ? () => modal.displayImage(getFullSizeImageUrl(src), alt) : undefined
	);

	let rotation = $state(0);

	function rotateImage() {
		rotation = rotation + 90;
	}
</script>

<ImageModal bind:this={modal} />
<div class="relative flex h-full w-full items-center justify-center">
	<button class="flex cursor-pointer items-center justify-center" {onclick}>
		{#if src != null}
			<div class="flex items-center justify-center">
				<img
					{src}
					{alt}
					class="max-h-full max-w-full cursor-pointer rounded-lg object-contain"
					style="transform: rotate({rotation}deg); transition: transform 0.3s ease;"
				/>
			</div>
		{:else}
			<div
				class="mt-4 flex min-h-[120px] min-w-[120px] items-center justify-center rounded-lg bg-gray-200"
			>
				<img src="/Placeholder.svg" alt="Image not available" height="24" aria-hidden="true" />
			</div>
		{/if}
	</button>
	{#if src != null}
		<button
			class="btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100 absolute right-2 bottom-2"
			onclick={(e) => {
				e.stopPropagation();
				rotateImage();
			}}
			title="Rotate image"
			aria-label="Rotate image 90 degrees clockwise"
		>
			<span class="icon-[mdi--rotate-right] h-4 w-4"></span>
		</button>
	{/if}
</div>
