<script lang="ts">
	import { onMount } from 'svelte';
	import { useZoomImageWheel } from '@zoom-image/svelte';

	type Props = { src?: string; alt?: string };
	let { src, alt }: Props = $props();

	let zoomLevel = $state(1);
	const MAX_ZOOM = 3;

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

	let container: HTMLDivElement | undefined = $state();
	const { createZoomImage, setZoomImageState } = useZoomImageWheel();

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
</script>

<div class="relative">
	<div bind:this={container} class="cursor-zoom-in overflow-hidden">
		<img {src} {alt} class="rounded-lg" />
	</div>
	<div class="absolute right-2 bottom-2 z-10 flex items-center gap-1">
		{#if zoomLevel > 1}
			<button
				class="btn btn-circle btn-xs bg-base-100/80 hover:bg-base-100"
				onclick={zoomOut}
				title="Zoom Out"
				aria-label="Zoom Out"
			>
				<span class="icon-[mdi--magnify-minus-outline] h-6 w-6"></span>
			</button>
			<span class="bg-base-100/80 rounded-md px-1 text-xs font-medium text-white"
				>{zoomLevel.toFixed(1)}x</span
			>
			<button
				class="btn btn-circle btn-xs bg-base-100/80 hover:bg-base-100"
				onclick={resetZoom}
				title="Reset Zoom"
				aria-label="Reset Zoom"
			>
				<span class="icon-[mdi--magnify-close] h-6 w-6"></span>
			</button>
		{/if}
		{#if zoomLevel < MAX_ZOOM}
			<button
				class="btn btn-circle btn-xs bg-base-100/80 hover:bg-base-100"
				onclick={zoomIn}
				title="Zoom In"
				aria-label="Zoom In"
			>
				<span class="icon-[mdi--magnify-plus-outline] h-6 w-6"></span>
			</button>
		{/if}
	</div>
</div>
