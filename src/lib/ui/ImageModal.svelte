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
	let zoomLevel = $state(1);
	const MAX_ZOOM = 3;

	export function displayImage(url: string, alt?: string) {
		image = { url, alt };
		zoomLevel = 1;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		setZoomImageState({ currentZoom: 1 });
		zoomLevel = 1;
	}

	function zoomIn(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		const newZoom = Math.min(zoomLevel + 0.5, MAX_ZOOM);
		setZoomImageState({ currentZoom: newZoom });
		zoomLevel = newZoom;
	}

	function zoomOut(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		const newZoom = Math.max(zoomLevel - 0.5, 1);
		setZoomImageState({ currentZoom: newZoom });
		zoomLevel = newZoom;
	}

	function resetZoom(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		setZoomImageState({ currentZoom: 1 });
		zoomLevel = 1;
	}

	onMount(() => {
		if (container) {
			createZoomImage(container, {
				maxZoom: MAX_ZOOM,
				wheel: { step: 0.5 },
				zoomOnHover: true,
				zoomOnClick: true,
				onZoomChange: (zoom: number) => {
					zoomLevel = zoom;
				}
			});
		}
	});

	let container: HTMLDivElement | undefined = $state();
	const { createZoomImage, setZoomImageState } = useZoomImageWheel();
</script>

<dialog
	class="border-base-300 bg-base-100 fixed inset-0 m-auto max-h-[95vh] max-w-[95vw] border p-0 shadow-lg"
	bind:this={dialog}
	onclose={() => (image = undefined)}
	onclick={self(() => close())}
>
	<div class="relative flex h-full w-full flex-col">
		<div class="absolute top-2 right-2 z-10">
			<button
				class="btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100"
				onclick={(e) => {
					e.stopPropagation();
					close();
				}}
				title="Close"
				aria-label="Close image"
			>
				<span class="icon-[mdi--close] h-5 w-5"></span>
			</button>
		</div>

		<div
			bind:this={container}
			class="flex h-full w-full cursor-zoom-in items-center justify-center overflow-hidden p-6"
		>
			<img class="max-h-[85vh] max-w-[85vw] object-contain" src={image?.url} alt={image?.alt} />
		</div>

		<div class="absolute right-4 bottom-4 z-10 flex items-center gap-2">
			{#if zoomLevel > 1}
				<button
					class="btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100"
					onclick={zoomOut}
					title="Zoom Out"
					aria-label="Zoom Out"
				>
					<span class="icon-[mdi--magnify-minus-outline] h-5 w-5"></span>
				</button>
				<span class="bg-base-100/80 rounded-md px-2 text-sm font-medium text-white"
					>{zoomLevel.toFixed(1)}x</span
				>
				<button
					class="btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100"
					onclick={resetZoom}
					title="Reset Zoom"
					aria-label="Reset Zoom"
				>
					<span class="icon-[mdi--magnify-close] h-5 w-5"></span>
				</button>
			{/if}
			{#if zoomLevel < MAX_ZOOM}
				<button
					class="btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100"
					onclick={zoomIn}
					title="Zoom In"
					aria-label="Zoom In"
				>
					<span class="icon-[mdi--magnify-plus-outline] h-5 w-5"></span>
				</button>
			{/if}
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
