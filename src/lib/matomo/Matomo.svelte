<!--
SPDX-FileCopyrightText:  Andreas Nüßlein <andreas@nuessle.in>
SPDX-FileCopyrightText:  Mikkel Eide Eriksen <mikkel.eriksen@gmail.com>
SPDX-FileCopyrightText:  VaiTon <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later

Initially taken from https://github.com/sinnwerkstatt/sveltekit-matomo
-->

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';

	import { tracker, type Tracker } from './tracker';

	interface Props {
		url: string;
		siteId: number;
		disableCookies?: boolean;
		requireConsent?: boolean;
		doNotTrack?: boolean;
		enableCrossDomainLinking?: boolean;
		domains?: string[];
		heartBeat?: number | null;
		linkTracking?: boolean | null;
		onTrackerReady?: (tracker: Tracker) => void;
		onError?: (error: Error) => void;
	}

	let {
		url,
		siteId,
		disableCookies = false,
		requireConsent = false,
		doNotTrack = false,
		enableCrossDomainLinking = false,
		domains = [],
		heartBeat = 15,
		linkTracking = null,
		onTrackerReady,
		onError
	}: Props = $props();

	let checkInterval: ReturnType<typeof setInterval> | null = null;
	let scriptElement: HTMLScriptElement | null = null;
	let scriptLoadError = $state(false);

	function isMatomoLoaded(): boolean {
		return typeof window !== 'undefined' && 'Matomo' in window && window.Matomo !== undefined;
	}

	async function initializeMatomo() {
		if (!isMatomoLoaded()) {
			return;
		}

		try {
			const matomo = window.Matomo;
			if (!matomo) return;

			const track = matomo.getTracker(`${url}/matomo.php`, siteId);
			if (!track) return;

			if (disableCookies) track.disableCookies();
			if (requireConsent) track.requireConsent();
			if (doNotTrack) track.setDoNotTrack(true);
			if (heartBeat) track.enableHeartBeatTimer(heartBeat);
			if (enableCrossDomainLinking) track.enableCrossDomainLinking();
			if (domains.length) track.setDomains(domains);
			if (linkTracking !== null) track.enableLinkTracking(linkTracking);

			tracker.set(track);

			// Allow custom initialization before first page view
			if (onTrackerReady) {
				onTrackerReady(track);
			}

			track.setCustomUrl(page.url.href);
			track.trackPageView();
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			if (onError) {
				onError(err);
			} else {
				console.error('Matomo initialization error:', err);
			}
		}
	}

	function handleScriptError() {
		scriptLoadError = true;
		const error = new Error('Failed to load Matomo script');
		if (onError) {
			onError(error);
		} else {
			console.error(error);
		}
		if (checkInterval) {
			clearInterval(checkInterval);
			checkInterval = null;
		}
	}

	onMount(() => {
		if (scriptLoadError) return;

		// Check if Matomo is already loaded (e.g., from cache)
		if (isMatomoLoaded()) {
			initializeMatomo();
			return;
		}

		// Poll for Matomo to be loaded
		let attempts = 0;
		const maxAttempts = 100; // 5 seconds with 50ms intervals

		checkInterval = setInterval(() => {
			attempts++;

			if (isMatomoLoaded()) {
				if (checkInterval) {
					clearInterval(checkInterval);
					checkInterval = null;
				}
				initializeMatomo();
			} else if (attempts >= maxAttempts) {
				if (checkInterval) {
					clearInterval(checkInterval);
					checkInterval = null;
				}
				handleScriptError();
			}
		}, 50);
	});

	onDestroy(() => {
		if (checkInterval) {
			clearInterval(checkInterval);
			checkInterval = null;
		}
		if (scriptElement) {
			scriptElement.removeEventListener('error', handleScriptError);
			scriptElement = null;
		}
	});

	afterNavigate(async ({ to }) => {
		if (!$tracker) {
			await initializeMatomo();
			return;
		}

		if (to?.url.href && $tracker) {
			try {
				$tracker.setCustomUrl(to.url.href);
				$tracker.trackPageView();
			} catch (error) {
				const err = error instanceof Error ? error : new Error(String(error));
				if (onError) {
					onError(err);
				} else {
					console.error('Matomo navigation tracking error:', err);
				}
			}
		}
	});
</script>

<svelte:head>
	<script
		async
		defer
		src={`${url}/matomo.js`}
		onerror={handleScriptError}
		bind:this={scriptElement}
	></script>
</svelte:head>
