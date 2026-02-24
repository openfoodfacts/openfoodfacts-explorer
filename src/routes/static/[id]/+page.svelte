<script lang="ts">
	import StaticPageIframe from '$lib/ui/StaticPageIframe.svelte';
	import { page } from '$app/state';
	import { locale } from 'svelte-i18n';
	import { onDestroy } from 'svelte';

	let currentLocale = 'en';
	let loading = true;
	let error = false;

	const unsubscribe = locale.subscribe((val) => {
		if (val) {
			currentLocale = val.split('-')[0];
		}
	});

	onDestroy(() => {
		unsubscribe();
	});

	// Locale-aware URL
	$: iframeUrl = `https://${currentLocale}.openfoodfacts.org/${page.params.id}?content_only=1`;

	function handleLoad() {
		loading = false;
		error = false;
	}

	function handleError() {
		loading = false;
		error = true;
	}
</script>
