<script lang="ts">
	import StaticPageIframe from '$lib/ui/StaticPageIframe.svelte';
	import { page } from '$app/state';
	import { locale } from '$lib/i18n';

	let language = $derived($locale?.split('-')[0] ?? 'world');
	let iframeUrl = $derived(`https://${language}.openfoodfacts.org/${page.params.id}?content_only=1`);
</script>

<StaticPageIframe src={iframeUrl} />
