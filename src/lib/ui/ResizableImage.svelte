<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		src?: string;
		alt?: string;
		zoom?: number;
		rotation?: number;
		minzoom?: number;
		maxzoom?: number;
	};
	let {
		src,
		alt,
		zoom = $bindable(1),
		rotation = $bindable(0),
		minzoom = 1,
		maxzoom = 3
	}: Props = $props();

	let imgEl: HTMLImageElement | undefined;

	onMount(() => {
		const wheelListener = (e: WheelEvent) => {
			e.preventDefault();
			if (e.deltaY < 0) {
				zoom = Math.min(zoom + 0.1, maxzoom);
			} else {
				zoom = Math.max(zoom - 0.1, minzoom);
			}
		};

		imgEl?.addEventListener('wheel', wheelListener);

		return () => {
			imgEl?.removeEventListener('wheel', wheelListener);
		};
	});
</script>

<div class="relative flex h-full w-full max-w-full items-center justify-center overflow-hidden">
	<img
		class="image"
		{src}
		{alt}
		style={`transform: scale(${zoom}) rotate(${rotation}deg);`}
		bind:this={imgEl}
	/>
</div>
