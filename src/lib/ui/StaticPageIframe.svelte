<script lang="ts">
	import { onMount } from 'svelte';
	export let src: string = '';
	export let title: string = '';

	let iframeEl: HTMLIFrameElement | null = null;
	let frameHeight = '';

	onMount(() => {
		window.addEventListener('message', function (event) {
			if (event.data.frameHeight) {
				console.debug('Received frameHeight:', event.data.frameHeight);
				frameHeight = event.data.frameHeight + 'px';
			}
		});
	});
</script>

<iframe
	bind:this={iframeEl}
	id="static-page-iframe"
	{src}
	class="w-full border-0"
	{title}
	scrolling="no"
	frameborder="0"
	style="height: {frameHeight};"
></iframe>
