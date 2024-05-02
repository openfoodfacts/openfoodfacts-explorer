<script lang="ts">
	import ImageModal from './ImageModal.svelte';

	export let src: string | undefined;
	export let alt: string | undefined;

	let modal: ImageModal;

	$: onclick = src != null ? () => modal.displayImage(src, alt) : undefined;
</script>

<ImageModal bind:this={modal} />

<button class="w-full" on:click={onclick}>
	<img {src} {alt} class="float-right w-full rounded-lg" />
</button>
