<script lang="ts">
	import StaticPageIframe from '$lib/ui/StaticPageIframe.svelte';
	import { page } from '$app/state';
	import { locale } from 'svelte-i18n';

	let loading = $state(true);
	let error = $state(false);

	const currentLocale = locale.derived(($locale) => ($locale ? $locale.split('-')[0] : 'en'));

	const iframeUrl = $derived.by(
		() => `https://${$currentLocale}.openfoodfacts.org/${page.params.id}?content_only=1`
	);

	function handleLoad() {
		loading = false;
		error = false;
	}

	function handleError() {
		loading = false;
		error = true;
	}
</script>

{#if loading}
	<div class="flex items-center justify-center py-10">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{/if}

{#if error}
	<div class="alert alert-error mt-4">
		<span>Failed to load page.</span>
	</div>
{/if}

<StaticPageIframe src={$iframeUrl} on:load={handleLoad} on:error={handleError} />
