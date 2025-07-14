<script lang="ts">
	import StaticPageIframe from '$lib/ui/StaticPageIframe.svelte';

	// get id from the URL
	import { page } from '$app/stores';
	$: pageId = $page.params.id;
</script>

<StaticPageIframe
	src={`https://world.openfoodfacts.org/${pageId}?content_only=1`}
	title="Discover Open Food Facts"
/>
