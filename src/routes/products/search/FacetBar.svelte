<script lang="ts">
	import type { Facet } from '$lib/api/search';
	import FacetCard from './FacetCard.svelte';

	type Props = {
		facets: Record<string, Facet>;
		onAddFacet: (facetKey: string, itemKey: string) => void;
		onRemoveFacet: (facetKey: string, itemKey: string) => void;
		onClose?: () => void;
	};

	let { facets, onAddFacet, onRemoveFacet, onClose }: Props = $props();

	function handleAddFacet(facetKey: string, itemKey: string) {
		onAddFacet(facetKey, itemKey);
		onClose?.();
	}

	function handleRemoveFacet(facetKey: string, itemKey: string) {
		onRemoveFacet(facetKey, itemKey);
		onClose?.();
	}
</script>

<div class="flex flex-wrap justify-center gap-4">
	{#if !facets || Object.keys(facets).length === 0}
		<div class="col-span-full text-center text-gray-500">
			<p>No facets available</p>
		</div>
	{/if}
	{#if facets && Object.keys(facets).length > 0}
		{#each Object.entries(facets) as [facetKey, facet] (facetKey)}
			<FacetCard
				{facet}
				selected={facet.items.filter((item) => item.selected).map((item) => item.key)}
				onSelect={(item) => handleAddFacet(facetKey, item.key)}
				onUnselect={(item) => handleRemoveFacet(facetKey, item.key)}
			/>
		{/each}
	{/if}
</div>
