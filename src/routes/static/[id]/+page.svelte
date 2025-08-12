<script lang="ts">
	import StaticPageIframe from '$lib/ui/StaticPageIframe.svelte';
	import { page } from '$app/state';

	let iframeUrl = $derived(`https://world.openfoodfacts.org/${page.params.id}?content_only=1`);
</script>

<StaticPageIframe src={iframeUrl} />
