<script lang="ts">
	import ImageModal from './ImageModal.svelte';

	type Props = { src?: string; alt?: string; className?: string };
	let { src, alt, className = '' }: Props = $props();

	let modal: ImageModal;
	let onclick = $derived(
		src != null
			? () => modal.displayImage(src.replace(/\.400\.|\.200\.|\.100\./, '.full.'), alt)
			: undefined
	);

	let rotation = $state(0);

	function rotateImage() {
		rotation = rotation + 90;
	}
</script>

<ImageModal bind:this={modal} />

<div class="relative">
	<button class="flex max-w-full justify-center" {onclick}>
		<img
			{src}
			{alt}
			class="float-right h-full rounded-lg {className}"
			style="transform: rotate({rotation}deg); transition: transform 0.3s ease;"
		/>
	</button>
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
</div>
