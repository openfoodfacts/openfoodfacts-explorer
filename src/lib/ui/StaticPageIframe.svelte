<script lang="ts">
	import { onMount, untrack } from 'svelte';

	type Props = {
		src: string;
		title?: string;
	};
	let { src, title = 'External Content' }: Props = $props();

	let frameHeight = $state<number | null>(null);
	let isIframeLoaded = $state(false);
	let hasTimeoutError = $state(false);

	let expectedOrigin = $derived.by(() => {
		try {
			return new URL(src).origin;
		} catch {
			console.warn(`[Iframe Component] Invalid URL provided: ${src}`);
			return null;
		}
	});

	let previousSrc = $state(src);
	let timeoutId: ReturnType<typeof setTimeout>;

	const resetTimeout = () => {
		clearTimeout(timeoutId);
		hasTimeoutError = false;
		timeoutId = setTimeout(() => {
			if (frameHeight === null) {
				hasTimeoutError = true;
				console.error(`[Iframe Component] Timeout waiting for frameHeight from ${src}`);
			}
		}, 8000);
	};

	$effect(() => {
		if (src !== previousSrc) {
			untrack(() => {
				frameHeight = null;
				isIframeLoaded = false;
				previousSrc = src;
				resetTimeout();
			});
		}
	});

	let showContent = $derived(frameHeight !== null && isIframeLoaded);

	onMount(() => {
		resetTimeout();
		const abortController = new AbortController();

		const handler = (event: MessageEvent) => {
			if (!expectedOrigin || event.origin !== expectedOrigin || !event.data?.frameHeight) return;

			const parsedHeight = parseInt(event.data.frameHeight, 10);
			if (!isNaN(parsedHeight) && parsedHeight > 0) {
				frameHeight = parsedHeight;
				clearTimeout(timeoutId);
			}
		};

		window.addEventListener('message', handler, { signal: abortController.signal });

		return () => {
			abortController.abort();
			clearTimeout(timeoutId);
		};
	});
</script>

<div
	class="relative w-full overflow-hidden transition-all duration-300"
	style="height: {frameHeight ? `${frameHeight}px` : '24rem'};"
>
	<div
		class="pointer-events-none absolute inset-0 z-10 flex w-full flex-col items-center justify-center bg-gray-200 transition-opacity duration-300 {showContent
			? 'opacity-0'
			: 'opacity-100'}"
	>
		{#if hasTimeoutError}
			<span class="font-medium text-red-500">Failed to load content.</span>
		{:else}
			<span class="animate-pulse font-medium text-gray-500">Loading content...</span>
		{/if}
	</div>

	{#key src}
		<iframe
			{src}
			{title}
			onload={() => (isIframeLoaded = true)}
			scrolling="no"
			sandbox="allow-scripts allow-same-origin allow-popups"
			class="absolute top-0 left-0 w-full overflow-hidden border-0 transition-opacity duration-300 {showContent &&
			!hasTimeoutError
				? 'opacity-100'
				: 'opacity-0'}"
			style="height: 100%;"
		></iframe>
	{/key}
</div>
