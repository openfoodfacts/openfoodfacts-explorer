<script lang="ts">
	import ImageModal from './ImageModal.svelte';

	export let src: string | undefined;
	export let alt: string | undefined;

	let modal: ImageModal;

	$: onclick = src != null ? () => modal.displayImage(src, alt) : undefined;
</script>

<ImageModal bind:this={modal} />

<button class="max-w-full" on:click={onclick}>
	<img {src} {alt} class="float-right h-full rounded-lg" />
</button>
