<script lang="ts">
	import { onMount } from 'svelte';
	import { useZoomImageWheel } from '@zoom-image/svelte';

	let image:
		| {
				url: string;
				alt?: string;
		  }
		| undefined;

	let dialog: HTMLDialogElement;

	export function displayImage(url: string, alt?: string) {
		image = { url, alt };
		dialog.showModal();
	}

	function close() {
		dialog.close();
		setZoomImageState({ currentZoom: 1 });
	}

	onMount(() => {
		createZoomImage(container);
	});

	let container: HTMLDivElement;
	const { createZoomImage, setZoomImageState } = useZoomImageWheel();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	class=" border-none bg-transparent p-4 backdrop:backdrop-brightness-50 md:max-h-max md:max-w-xl"
	bind:this={dialog}
	on:close={() => (image = undefined)}
	on:click|self={() => close()}
>
	<div bind:this={container}>
		<img class="max-h-full max-w-full" src={image?.url} alt={image?.alt} />
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
