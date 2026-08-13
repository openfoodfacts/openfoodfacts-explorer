<script lang="ts">
	import type { Facet, FacetItem } from '$lib/api/search';
	import type { FacetsSelection } from '$lib/facets';
	import FacetCard from './FacetCard.svelte';

	type Props = {
		facets: Record<string, Facet>;
		selectedFacets?: FacetsSelection;
		onToggleInclude: (facetKey: string, itemKey: string) => void;
		onToggleExclude: (facetKey: string, itemKey: string) => void;
	};

	let { facets, selectedFacets = {}, onToggleInclude, onToggleExclude }: Props = $props();
</script>

<div
	class="flex w-full max-w-full scrollbar-none items-center gap-2 pb-2 max-md:flex-nowrap max-md:overflow-x-auto max-md:has-[details[open]]:overflow-x-hidden md:flex-wrap md:justify-center md:gap-4 md:overflow-visible"
>
	{#if !facets || Object.keys(facets).length === 0}
		<div class="col-span-full text-center text-gray-500">
			<p>No facets available</p>
		</div>
	{/if}
	{#if facets && Object.keys(facets).length > 0}
		{#each Object.entries(facets) as [facetKey, facet] (facetKey)}
			{@const sel = selectedFacets[facetKey]}
			{@const selectedInclude =
				sel?.include ?? facet.items.filter((item) => item.selected).map((item) => item.key)}
			{@const selectedExclude = sel?.exclude ?? []}
			<FacetCard
				{facet}
				{selectedInclude}
				{selectedExclude}
				onToggleInclude={(item: FacetItem) => onToggleInclude(facetKey, item.key)}
				onToggleExclude={(item: FacetItem) => onToggleExclude(facetKey, item.key)}
			/>
		{/each}
	{/if}
</div>
