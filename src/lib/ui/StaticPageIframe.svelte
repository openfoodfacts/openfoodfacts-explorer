<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from '$lib/i18n';

	type Props = { src: string };
	let { src }: Props = $props();

	let frameHeight = $state<number | null>(null);
	let isLoaded = $state(false);
	let hasError = $state(false);
	let iframeEl = $state<HTMLIFrameElement | null>(null);

	// URL constructor throws on malformed strings; guard against SSR/runtime crashes.
	const expectedOrigin: string | null = (() => {
		try {
			return new URL(src).origin;
		} catch {
			return null;
		}
	})();

	let showContent = $derived(frameHeight !== null && isLoaded && !hasError);

	onMount(() => {
		const ac = new AbortController();

		// External page never posts frameHeight on network/server failure;
		// surface a graceful error instead of an infinite spinner.
		const timeoutId = setTimeout(() => {
			if (frameHeight === null) hasError = true;
		}, 8000);

		window.addEventListener(
			'message',
			(e: MessageEvent) => {
				// Validate: origin matches the iframe URL, the message came from
				// our own iframe (not a sibling iframe on the page), and the
				// payload has the expected shape.
				if (
					e.origin !== expectedOrigin ||
					e.source !== iframeEl?.contentWindow ||
					!e.data?.frameHeight
				)
					return;

				const h = parseInt(e.data.frameHeight, 10);
				if (Number.isFinite(h) && h > 0) {
					frameHeight = h;
					clearTimeout(timeoutId);
				}
			},
			{ signal: ac.signal }
		);

		return () => {
			ac.abort();
			clearTimeout(timeoutId);
		};
	});
</script>

<div class="relative w-full" style:height={frameHeight !== null ? `${frameHeight}px` : '24rem'}>
	<!-- scrolling="no" prevents the iframe's internal scrollbar; height is
	     driven by the postMessage payload from the embedded page. -->
	<iframe
		bind:this={iframeEl}
		{src}
		title="External Content"
		onload={() => (isLoaded = true)}
		scrolling="no"
		class="absolute inset-0 border-0"
	></iframe>

	{#if !showContent}
		<div
			role="status"
			aria-live="polite"
			class="absolute inset-0 flex items-center justify-center bg-gray-100"
		>
			{#if hasError}
				<span class="font-medium text-red-500">{$_('static_iframe.load_failed')}</span>
			{:else}
				<span class="animate-pulse font-medium text-gray-500">{$_('general.loading')}</span>
			{/if}
		</div>
	{/if}
</div>
