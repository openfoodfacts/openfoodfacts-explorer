<script lang="ts">
	type Props = { src: string };
	let { src }: Props = $props();

	let frameHeight = $state('100vh'); // Default height, can be adjusted

	$effect(() => {
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

<iframe
	{src}
	title="External Content"
	class="w-full overflow-visible border-0"
	style="height: {frameHeight};"
></iframe>
