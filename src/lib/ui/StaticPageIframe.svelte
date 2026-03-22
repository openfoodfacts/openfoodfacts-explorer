<script lang="ts">
	import { onMount } from 'svelte';

	type Props = { src: string };
	let { src }: Props = $props();

	let frameHeight = $state('100vh'); // Default height, can be adjusted
	onMount(() => {
		const abortController = new AbortController();

		const handler = (event: MessageEvent) => {
			if (!event.data?.frameHeight) return;

			console.debug('Received frameHeight:', event.data.frameHeight);
			frameHeight = event.data.frameHeight + 'px';
		};

		window.addEventListener('message', handler, {
			signal: abortController.signal
		});

		return () => {
			window.removeEventListener('message', handler);
			abortController.abort();
		};
	});
</script>

<iframe
	{src}
	title="External Content"
	class="w-full overflow-visible border-0"
	style="height: {frameHeight};"
></iframe>
