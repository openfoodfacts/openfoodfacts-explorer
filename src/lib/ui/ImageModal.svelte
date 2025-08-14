<script lang="ts">
	import { onMount } from 'svelte';
	import { useZoomImageWheel } from '@zoom-image/svelte';

	type ImageState = { url: string; alt?: string };
	let image: ImageState | undefined = $state();

	let dialog: HTMLDialogElement | undefined = $state();
	let zoomLevel = $state(1);
	const MAX_ZOOM = 3;

	let rotation = $state(0);

	export function displayImage(url: string, alt?: string) {
		image = { url, alt };
		zoomLevel = 1;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		zoomLevel = 1;
	}

	function zoomIn(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		zoomLevel = Math.min(zoomLevel + 0.5, MAX_ZOOM);
	}

	function zoomOut(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		zoomLevel = Math.max(zoomLevel - 0.5, 1);
	}

	function resetZoom(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		zoomLevel = 1;
	}

	function rotateRight() {
		rotation = rotation + 90;
	}

	function rotateLeft() {
		rotation = rotation - 90;
	}

	let container: HTMLDivElement | undefined = $state();
	const { createZoomImage, setZoomImageState, zoomImageState } = useZoomImageWheel();

	$effect(() => {
		setZoomImageState?.({ currentZoom: zoomLevel, currentRotation: rotation });
	});

	onMount(() => {
		if (container) {
			createZoomImage(container, {
				maxZoom: MAX_ZOOM,
				wheelZoomRatio: 0.5,
				shouldZoomOnSingleTouch: () => true
			});
			zoomImageState.subscribe((state) => {
				zoomLevel = state.currentZoom;
			});
		}
	});
</script>

<dialog
	class="border-base-300 bg-base-100 fixed inset-0 m-auto h-[90vh] w-[90vw] rounded-xl border p-0 shadow-lg"
	bind:this={dialog}
	onclose={() => (image = undefined)}
	onclick={(e) => {
		if (e.target === dialog) {
			close();
		}
	}}
>
	<div class="relative flex h-full w-full flex-col">
		<div
			bind:this={container}
			class="flex h-full w-full cursor-move items-center justify-center overflow-hidden p-6"
		>
			<img class="max-h-[85vh] max-w-[85vw] object-contain" src={image?.url} alt={image?.alt} />
		</div>

		<div class="absolute right-2 z-10 flex h-full flex-col items-center justify-center gap-2">
			<button
				class="btn btn-circle btn-md bg-base-100/80 hover:bg-base-100"
				onclick={zoomIn}
				title="Zoom In"
				aria-label="Zoom In"
				disabled={zoomLevel >= MAX_ZOOM}
			>
				<span class="icon-[mdi--magnify-plus-outline] h-6 w-6"></span>
			</button>
			<button
				class="btn bg-base-100/80 hover:bg-base-100 text-md px-2 py-2 font-medium text-white"
				onclick={resetZoom}
			>
				{zoomLevel.toFixed(1)} x
			</button>
			<button
				class="btn btn-circle btn-md bg-base-100/80 hover:bg-base-100"
				onclick={zoomOut}
				title="Zoom Out"
				aria-label="Zoom Out"
				disabled={zoomLevel <= 1}
			>
				<span class="icon-[mdi--magnify-minus-outline] h-6 w-6"></span>
			</button>
		</div>

		<div class="absolute top-2 right-2 z-10">
			<button
				class="btn btn-circle btn-md bg-base-100/80 hover:bg-base-100"
				onclick={(e) => {
					e.stopPropagation();
					close();
				}}
				title="Close"
				aria-label="Close image"
			>
				<span class="icon-[mdi--close] h-6 w-6"></span>
			</button>
		</div>

		<div class="absolute right-2 bottom-2 z-10 flex gap-2">
			<button
				class="btn btn-circle btn-md bg-base-100/80 hover:bg-base-100"
				onclick={rotateLeft}
				title="Rotate Left"
				aria-label="Rotate Left"
			>
				<span class="icon-[mdi--rotate-left] h-6 w-6"></span>
			</button>
			<button
				class="btn btn-circle btn-md bg-base-100/80 hover:bg-base-100"
				onclick={rotateRight}
				title="Rotate Right"
				aria-label="Rotate Right"
			>
				<span class="icon-[mdi--rotate-right] h-6 w-6"></span>
			</button>
		</div>
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
