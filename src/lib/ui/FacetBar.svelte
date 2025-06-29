<script lang="ts">
	let {
		facets = {}
	}: {
		facets: {
			[key: string]: {
				name: string;
				items: Array<{ key: string; name: string; count: number; selected: boolean }>;
				count_error_margin: number;
			};
		};
	} = $props();

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

	const updateSearchQuery = (facetKey: string, query: string) => {
		searchQueries = { ...searchQueries, [facetKey]: query };
	};

	const filteredOptions = (items: any[], query: string) => {
		if (!items || !Array.isArray(items)) return [];
		if (!query || typeof query !== 'string') query = '';
		return items.filter(
			(item) =>
				typeof item.name === 'string' && item.name.toLowerCase().includes(query.toLowerCase())
		);
	};

	const getVisibleOptions = (items: any[], query: string, facetKey: string) => {
		if (query) {
			return filteredOptions(items, query);
		}
		return showAll[facetKey] ? items : items.slice(0, 5);
	};

	const toggleShowAll = (facetKey: string) => {
		showAll = { ...showAll, [facetKey]: !showAll[facetKey] };
	};
</script>

<div class="menu menu-horizontal w-full justify-evenly rounded-lg p-4">
	{#each Object.entries(facets) as [facetKey, facet]}
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
								bind:checked={item.selected}
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
