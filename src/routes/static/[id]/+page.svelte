<script lang="ts">
	import StaticPageIframe from '$lib/ui/StaticPageIframe.svelte';
	import { page } from '$app/state';
	import { locale } from 'svelte-i18n';

	let loading = $state(true);
	let error = $state(false);

	const currentLocale = $derived(() => {
		const val = $locale;
		return val ? val.split('-')[0] : 'en';
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
