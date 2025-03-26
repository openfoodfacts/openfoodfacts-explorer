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
	<div class="flex justify-center overflow-hidden">
		<div style="width: fit-content; height: fit-content; transform-origin: center center;">
			<button class="flex justify-center" {onclick}>
				<img
					{src}
					{alt}
					class="rounded-lg"
					style="transform: rotate({rotation}deg); transition: transform 0.3s ease;"
				/>
			</button>
		</div>
	</div>
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
