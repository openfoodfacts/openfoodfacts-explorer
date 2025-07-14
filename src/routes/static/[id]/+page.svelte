<script lang="ts">
	import StaticPageIframe from '$lib/ui/StaticPageIframe.svelte';
	import { page } from '$app/stores';

	// get id from the URL
	const pageId = $derived($page.params.id);
</script>

<StaticPageIframe
	src={`https://world.openfoodfacts.org/${pageId}?content_only=1`}
	title="Discover Open Food Facts"
/>
