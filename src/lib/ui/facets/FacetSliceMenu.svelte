<script lang="ts">
	import { _, getLocale } from '#lib/i18n/index.js';
	import type { FacetPair } from '#lib/api/facets.js';
	import { withLocationPrefix } from '#lib/location-link.js';
	import { parseUrlLocation } from '#lib/url-location.js';
	import { EXPLORE_BY_FACETS, SLICE_FACETS, facetPairsHref } from './facet-links';

	type Tag = { id: string; name: string; products: number };
	type Group = { facet: string; tags: Tag[] };

	type Props = {
		facetPairs: FacetPair[];
		/** The path of the current page */
		pathname: string;
		/** The search options to keep in the links, e.g. "?sort_by=popularity" */
		query: string;
	};

	let { facetPairs, pathname, query }: Props = $props();

	// Loaded the first time the menu opens, so pages that don't use it make no extra requests
	let groups: Promise<Group[]> | null = $state(null);
	let search = $state('');

	// Facets without values in the menu still link to their full list
	const otherFacets = $derived(
		EXPLORE_BY_FACETS.filter(
			(facet) => !SLICE_FACETS.includes(facet) && !facetPairs.some((pair) => pair.facet === facet)
		)
	);

	async function loadGroups(): Promise<Group[]> {
		const location = parseUrlLocation(pathname);
		const lang = location?.language ?? getLocale().split('-')[0].toLowerCase();
		const path = facetPairs.map((pair) => `${pair.facet}/${pair.value}`).join('/');
		const params = new URLSearchParams({ path, lang });
		const url = withLocationPrefix(`/api/facet-slice?${params}`, location, pathname);

		const response = await fetch(url);
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		const body: { groups: Group[] } = await response.json();
		return body.groups;
	}

	function onToggle(event: Event) {
		const details = event.currentTarget as HTMLDetailsElement;
		if (details.open && groups == null) {
			groups = loadGroups();
		}
	}

	function matchesSearch(tag: Tag) {
		return tag.name.toLowerCase().includes(search.trim().toLowerCase());
	}

	function facetName(facet: string) {
		return $_(`facets.names.${facet}`, { default: facet });
	}

	/** Link to this page with one more filter. */
	function valueHref(facet: string, value: string) {
		return facetPairsHref([...facetPairs, { facet, value }], pathname, { query });
	}

	/** Link to the full list of a facet's values for the products of this page. */
	function listHref(facet: string) {
		return facetPairsHref(facetPairs, pathname, { listFacet: facet, query });
	}
</script>

<details class="dropdown dropdown-end shrink-0" ontoggle={onToggle}>
	<summary class="btn btn-primary btn-sm">
		+ {$_('facets.slice_by', { default: 'Slice by another facet' })}
	</summary>
	<div
		class="dropdown-content z-50 mt-2 w-[min(90vw,28rem)] rounded-box border border-base-content/10 bg-base-100 p-4 shadow-lg"
	>
		<p class="mb-3 font-semibold">
			{$_('facets.slice_title', { default: 'Narrow down with another facet' })}
		</p>
		<input
			type="search"
			class="input mb-2 w-full rounded-md input-sm"
			bind:value={search}
			placeholder={$_('facets.slice_search', { default: 'Search country, label, brand…' })}
			aria-label={$_('facets.slice_search', { default: 'Search country, label, brand…' })}
		/>

		<div class="max-h-80 overflow-y-auto pr-1">
			{#if groups}
				{#await groups}
					<span class="loading mt-3 loading-sm loading-spinner"></span>
				{:then loadedGroups}
					{#each loadedGroups as group (group.facet)}
						{@const tags = group.tags.filter(matchesSearch)}
						{#if tags.length > 0}
							<div class="mt-3 mb-2 flex items-baseline justify-between">
								<span class="text-xs font-semibold uppercase opacity-60">
									{facetName(group.facet)}
								</span>
								<a class="link text-xs opacity-60" href={listHref(group.facet)}>
									{$_('facets.slice_see_all', { default: 'See all' })}
								</a>
							</div>
							<div class="flex flex-wrap gap-2">
								{#each tags as tag (tag.id)}
									<a
										class="rounded-md border border-base-content/20 bg-base-200 px-3 py-1 text-sm transition hover:border-base-content/50"
										href={valueHref(group.facet, tag.id)}
									>
										{tag.name}
										<span class="ml-1 font-mono text-xs opacity-60">({tag.products})</span>
									</a>
								{/each}
							</div>
						{/if}
					{/each}
				{:catch}
					<p class="mt-3 text-sm opacity-70">
						{$_('facets.slice_error', { default: 'Could not load the values.' })}
					</p>
				{/await}
			{/if}

			{#if otherFacets.length > 0}
				<p class="mt-4 mb-2 text-xs font-semibold uppercase opacity-60">
					{$_('facets.slice_more', { default: 'More facets' })}
				</p>
				<div class="flex flex-wrap gap-x-3 gap-y-1 text-sm">
					{#each otherFacets as facet (facet)}
						<a class="link" href={listHref(facet)}>{facetName(facet)}</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</details>
