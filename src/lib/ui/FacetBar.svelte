<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type FacetItem = {
		key: string;
		name: string;
		count: number;
		selected: boolean;
	};

	type Facet = {
		name: string;
		items: FacetItem[];
		count_error_margin: number;
	};

	type FacetsType = {
		[key: string]: Facet;
	};

	let {
		facets = {} as FacetsType
	} = $props<{ facets: FacetsType }>();

	let searchQueries = $state<Record<string, string>>(
		Object.keys(facets).reduce<Record<string, string>>((acc, key) => {
			acc[key] = '';
			return acc;
		}, {})
	);

	let showAll = $state<Record<string, boolean>>(
		Object.keys(facets).reduce<Record<string, boolean>>((acc, key) => {
			acc[key] = false;
			return acc;
		}, {})
	);

	const dispatch = createEventDispatcher();

	const updateSearchQuery = (facetKey: string, query: string) => {
		searchQueries = { ...searchQueries, [facetKey]: query };
	};

	const filteredOptions = (items: FacetItem[], query: string) => {
		if (!items || !Array.isArray(items)) return [];
		if (!query || typeof query !== 'string') query = '';
		return items.filter(
			(item) =>
				typeof item.name === 'string' && item.name.toLowerCase().includes(query.toLowerCase())
		);
	};

	const getVisibleOptions = (items: FacetItem[], query: string, facetKey: string) => {
		if (query) {
			return filteredOptions(items, query);
		}
		return showAll[facetKey] ? items : items.slice(0, 5);
	};

	const toggleShowAll = (facetKey: string) => {
		showAll = { ...showAll, [facetKey]: !showAll[facetKey] };
	};

	function onFacetToggle(facetKey: string, itemKey: string, selected: boolean) {
		const updatedItems = facets[facetKey].items.map((item: FacetItem) =>
			item.key === itemKey ? { ...item, selected } : item
		);
		facets = {
			...facets,
			[facetKey]: {
				...facets[facetKey],
				items: updatedItems
			}
		};
		
		const selectedItems = updatedItems.filter((item: FacetItem) => item.selected).map((item: FacetItem) => item.key);
		dispatch('facetChange', {
			facetKey,
			selectedItems
		});
	}

	// Export function to get all selected items across all facets
	export function getSelectedFacets() {
		const selected = Object.entries(facets).flatMap(([facetKey, facet]) => {
			const typedFacet = facet as Facet;
			return typedFacet.items
				.filter((item: FacetItem) => item.selected)
				.map((item: FacetItem) => ({
					facetKey,
					facetName: typedFacet.name,
					itemKey: item.key,
					itemName: item.name
				}));
		});
		return selected;
	}

	// Export function to remove a selected facet
	export function removeFacet(facetKey: string, itemKey: string) {
		onFacetToggle(facetKey, itemKey, false);
	}
</script>

<div class="menu menu-horizontal w-full justify-evenly rounded-lg p-4">
	{#each Object.entries(facets) as [facetKey, facetObj]}
		{@const facet = facetObj as Facet}
		<div class="dropdown dropdown-center">
			<button type="button" class="btn flex w-58 items-center justify-start gap-2">
				{facet.name} ({facet.items.length})
				<span class="flex-grow"></span>
				<i class="icon-[mdi--chevron-down] text-xl"></i>
			</button>
			<ul class="dropdown-content menu bg-base-100 rounded-box w-full p-2 shadow">
				<li>
					<input
						type="text"
						placeholder="Search..."
						class="input input-bordered mb-2 w-full"
						bind:value={searchQueries[facetKey]}
						oninput={(e) =>
							updateSearchQuery(facetKey, (e.target as HTMLInputElement)?.value ?? '')}
					/>
				</li>
				{#each getVisibleOptions(facet.items, searchQueries[facetKey], facetKey) as item}
					<li>
						<label class="flex items-center">
							<input
								type="checkbox"
								class="checkbox checkbox-secondary"
								checked={item.selected}
								onchange={(e) =>
									onFacetToggle(facetKey, item.key, (e.target as HTMLInputElement)?.checked)}
							/>
							<span class="ml-2">{item.name} ({item.count})</span>
						</label>
					</li>
				{/each}
				<li>
					<button type="button" class="btn btn-link w-full" onclick={() => toggleShowAll(facetKey)}>
						{showAll[facetKey] ? 'Show Less' : 'See All'}
					</button>
				</li>
			</ul>
		</div>
	{/each}
</div>
