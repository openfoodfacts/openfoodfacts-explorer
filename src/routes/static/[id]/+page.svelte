<script lang="ts">
	import StaticPageIframe from '$lib/ui/StaticPageIframe.svelte';
	import { page } from '$app/state';
	import { locale } from 'svelte-i18n';
	import { get } from 'svelte/store';

	let loading = $state(true);
	let error = $state(false);

	// Use get() safely for initial value
	let currentLocale = $state('en');

	$effect(() => {
		const val = get(locale);
		currentLocale = val ? val.split('-')[0] : 'en';
	});

	const iframeUrl = $derived(() => {
		return `https://${currentLocale}.openfoodfacts.org/${page.params.id}?content_only=1`;
	});

	function handleLoad() {
		loading = false;
		error = false;
	}

	function handleError() {
		loading = false;
		error = true;
	}
</script>
