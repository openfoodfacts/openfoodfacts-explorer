<script lang="ts">
	import { onMount } from 'svelte';
	import { tracker, type MatomoTracker } from '$lib/matomo';

	type Props = {
		url: string;
		siteId: string | number;
	};

	let { url, siteId }: Props = $props();

	onMount(() => {
		if (!url || !siteId) return;

		const noop: MatomoTracker = {
			trackEvent: () => {
				// Keep tracking calls safe even when analytics is unavailable.
			}
		};

		tracker.set(noop);
	});
</script>
