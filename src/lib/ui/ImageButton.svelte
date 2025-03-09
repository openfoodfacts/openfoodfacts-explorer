<script lang="ts">
	import ImageModal from './ImageModal.svelte';

	type Props = { src?: string; alt?: string };
	let { src, alt }: Props = $props();

	let modal: ImageModal;
	let onclick = $derived(src != null ? () => modal.displayImage(src, alt) : undefined);
</script>

<ImageModal bind:this={modal} />

<button class="max-w-full flex justify-center" {onclick}>
	<img {src} {alt} class="float-right h-full rounded-lg" />
</button>
