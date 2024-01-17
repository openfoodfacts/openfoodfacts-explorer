<script lang="ts">
	import { onMount } from 'svelte';
	import { useZoomImageWheel } from '@zoom-image/svelte';

	let image:
		| {
				url: string;
				alt: string;
		  }
		| undefined;

	let dialog: HTMLDialogElement;

	export function displayImage(url: string, alt: string) {
		dialog.showModal();
		image = { url, alt };
	}

	let container: HTMLDivElement;
	const { createZoomImage } = useZoomImageWheel();

	onMount(() => {
		createZoomImage(container);
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	class="max-h-max max-w-xl border-r-2 border-none p-4 backdrop:backdrop-brightness-50"
	bind:this={dialog}
	on:close={() => (image = undefined)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<button on:click={() => dialog.close()} id="close" class="rounded-md p-2 hover:bg-secondary">
			<span class="icon-[mdi--close]"></span>
		</button>
	</div>

	<div class="imageContainer" bind:this={container}>
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
