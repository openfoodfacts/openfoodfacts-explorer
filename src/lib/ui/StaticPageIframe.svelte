<script lang="ts">
	import { onMount } from 'svelte';

	type Props = { src: string };
	let { src }: Props = $props();

	let frameHeight = $state('100vh'); // Default height, can be adjusted

	onMount(() => {
		const abortController = new AbortController();
		window.addEventListener(
			'message',
			(event: { data: { frameHeight?: number } }) => {
				if (!event.data.frameHeight) return;

				console.debug('Received frameHeight:', event.data.frameHeight);
				frameHeight = event.data.frameHeight + 'px';
			},
			{ signal: abortController.signal }
		);

		return () => {
			abortController.abort(); // Cleanup the event listener on component unmount
		};
	});
</script>

<iframe {src} class="w-full border-0" scrolling="no" frameborder="0" style="height: {frameHeight};"
></iframe>
