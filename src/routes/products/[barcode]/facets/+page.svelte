<script lang="ts">
	import FacetsKnowledgePanel from '$lib/components/FacetsKnowledgePanel.svelte';
	import { page } from '$app/stores';
	import { t } from '$lib/translations';

	// Get the barcode from the URL parameters
	$: barcode = $page.params.barcode;
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold">{$t('product.facets.title')}</h1>
	{#if barcode}
		<FacetsKnowledgePanel {barcode} />
	{:else}
		<div class="alert alert-error">
			<span>{$t('product.facets.no_barcode')}</span>
		</div>
	{/if}
</div>
