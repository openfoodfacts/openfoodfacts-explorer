<script lang="ts">
	import ImageModal from './ImageModal.svelte';

	type Props = { src?: string; alt?: string };
	let { src, alt }: Props = $props();

	let modal: ImageModal;
	let onclick = $derived(src != null ? () => modal.displayImage(src, alt) : undefined);

	let rotation = $state(0);

	function rotateImage() {
		rotation = rotation + 90;
	}
</script>

<ImageModal bind:this={modal} />

<div class="relative">
	<img
  src={src && src.trim() !== '' ? src : '/Placeholder.svg'}
  alt={alt ?? 'Placeholder Image'}
  class="float-right h-full object-contain bg-gray-200 p-2 rounded-lg"
  style="
    transform: rotate({rotation}deg);
    transition: transform 0.3s ease;
    filter: {src && src.trim() !== '' ? 'none' : 'grayscale(100%)'};
  "
/>

	{#if src && !src?.includes('Placeholder.svg')}
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
