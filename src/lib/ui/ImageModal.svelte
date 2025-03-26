<script lang="ts">
	import { self } from 'svelte/legacy';
	import { onMount } from 'svelte';
	import { useZoomImageWheel } from '@zoom-image/svelte';

	let image:
		| {
				url: string;
				alt?: string;
		  }
		| undefined = $state();

	let dialog: HTMLDialogElement | undefined = $state();
	let rotation = $state(0);

	export function displayImage(url: string, alt?: string) {
		image = { url, alt };
		rotation = 0;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		setZoomImageState({ currentZoom: 1 });
		rotation = 0;
	}

	function rotateImage() {
		rotation = rotation + 90;
	}

	onMount(() => {
		if (container) {
			createZoomImage(container);
		}
	});

	let container: HTMLDivElement | undefined = $state();
	const { createZoomImage, setZoomImageState } = useZoomImageWheel();
</script>

<dialog
	class="border-none bg-transparent p-4 backdrop:backdrop-brightness-50 md:max-h-max md:max-w-xl"
	bind:this={dialog}
	onclose={() => (image = undefined)}
	onclick={self(() => close())}
>
	<div class="relative">
		<div bind:this={container}>
			<img
				class="max-h-full max-w-full"
				src={image?.url}
				alt={image?.alt}
				style="transform: rotate({rotation}deg); transition: transform 0.3s ease;"
			/>
		</div>
		<button
			class="btn btn-circle bg-base-100/80 hover:bg-base-100 absolute right-4 bottom-4"
			onclick={(e) => {
				e.stopPropagation();
				rotateImage();
			}}
			title="Rotate image"
			aria-label="Rotate image 90 degrees clockwise"
		>
			<span class="icon-[mdi--rotate-right] h-6 w-6"></span>
		</button>
	</div>
</dialog>

<style>
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
