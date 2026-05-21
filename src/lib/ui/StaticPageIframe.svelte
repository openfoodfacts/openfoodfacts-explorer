<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from '$lib/i18n';

	type Props = { src: string };
	let { src }: Props = $props();

	const LOAD_TIMEOUT_MS = 8000;

	let frameHeight = $state<number | null>(null);
	let hasError = $state(false);
	let iframeEl = $state<HTMLIFrameElement | null>(null);

	// URL constructor throws on malformed strings; guard against SSR/runtime crashes.
	const expectedOrigin = $derived(new URL(src).origin);

	onMount(() => {
		const ac = new AbortController();

		// External page never posts frameHeight on network/server failure;
		// surface a graceful error instead of an infinite spinner.
		const timeoutId = setTimeout(() => {
			if (frameHeight === null) hasError = true;
		}, LOAD_TIMEOUT_MS);

		const handler = (e: MessageEvent) => {
			// Validate: origin matches the iframe URL, the message came from
			// our own iframe (not a sibling iframe on the page), and the
			// payload has the expected shape.
			if (
				e.origin !== expectedOrigin ||
				e.source !== iframeEl?.contentWindow ||
				!e.data?.frameHeight
			) {
				return;
			}

			const h = parseInt(e.data.frameHeight, 10);
			if (!Number.isFinite(h) || h <= 0) {
				console.warn(`Received invalid frameHeight from ${e.origin}:`, e.data.frameHeight);
				return;
			}

			frameHeight = h;
			hasError = false;
			clearTimeout(timeoutId);
		};

		window.addEventListener('message', handler, { signal: ac.signal });

		return () => {
			ac.abort();
			clearTimeout(timeoutId);
		};
	});
</script>

{#if hasError}
	<div
		role="status"
		aria-live="polite"
		class="flex h-96 w-full items-center justify-center bg-gray-100"
	>
		<span class="font-medium text-red-500">{$_('static_iframe.load_failed')}</span>
	</div>
{:else}
	<!-- scrolling="no" prevents the iframe's internal scrollbar -->
	<iframe
		bind:this={iframeEl}
		{src}
		title="External Content"
		scrolling="no"
		class="w-full border-0"
		style:height={frameHeight !== null ? `${frameHeight}px` : '24rem'}
	></iframe>
{/if}
