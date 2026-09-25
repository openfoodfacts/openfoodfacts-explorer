<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from '$lib/i18n';

	type Props = { src: string };
	let { src }: Props = $props();

	// How long to wait for the iframe's `load` event before giving up.
	const LOAD_TIMEOUT_MS = 8000;
	// How long after `load` to wait for a `frameHeight` message before falling
	// back to a viewport-sized, internally scrollable frame.
	const HEIGHT_GRACE_MS = 1500;
	const INITIAL_HEIGHT = '24rem';
	// Roughly the viewport minus the navbar and some breathing room, so the
	// fallback frame fills the screen without overshooting it.
	const FALLBACK_HEIGHT = 'calc(100vh - 12rem)';

	// The iframe is only rendered client-side: a server-rendered iframe starts
	// loading before hydration attaches the `load` listener, so the event
	// would be missed.
	let mounted = $state(false);
	let frameHeight = $state<number | null>(null);
	let hasLoaded = $state(false);
	let useFallback = $state(false);
	let hasError = $state(false);
	let iframeEl = $state<HTMLIFrameElement | null>(null);

	// URL constructor throws on malformed strings; guard against SSR/runtime crashes.
	const expectedOrigin = $derived(new URL(src).origin);

	// When the embedded page tells us its exact height we size the frame to it
	// and let the main window scroll. Otherwise (the page doesn't post a
	// `frameHeight` — see #1842 review) we fall back to a viewport-sized frame
	// that scrolls internally, so the content is never cut off.
	const height = $derived(
		frameHeight !== null ? `${frameHeight}px` : useFallback ? FALLBACK_HEIGHT : INITIAL_HEIGHT
	);
	const scrolling = $derived(frameHeight !== null ? 'no' : 'auto');

	let graceTimeoutId: ReturnType<typeof setTimeout> | undefined;

	function handleLoad() {
		hasLoaded = true;
		hasError = false;
		if (frameHeight !== null) return;
		clearTimeout(graceTimeoutId);
		graceTimeoutId = setTimeout(() => {
			if (frameHeight === null) useFallback = true;
		}, HEIGHT_GRACE_MS);
	}

	onMount(() => {
		mounted = true;
		const ac = new AbortController();

		// A frame that never fires `load` (network drop, blocked request) would
		// otherwise sit on the initial placeholder forever.
		const loadTimeoutId = setTimeout(() => {
			if (!hasLoaded && frameHeight === null) hasError = true;
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
			useFallback = false;
			hasError = false;
			clearTimeout(loadTimeoutId);
			clearTimeout(graceTimeoutId);
		};

		window.addEventListener('message', handler, { signal: ac.signal });

		return () => {
			ac.abort();
			clearTimeout(loadTimeoutId);
			clearTimeout(graceTimeoutId);
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
{:else if mounted}
	<!-- scrolling="no" once we know the exact height, so only the main window scrolls -->
	<iframe
		bind:this={iframeEl}
		{src}
		title="External Content"
		{scrolling}
		class="w-full border-0"
		style:height
		onload={handleLoad}
	></iframe>
{:else}
	<div class="w-full" style:height={INITIAL_HEIGHT}></div>
{/if}
