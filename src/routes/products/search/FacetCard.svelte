<script lang="ts">
	import type { Facet, FacetItem } from '$lib/api/search';

	let {
		facet,
		selected,
		onSelect,
		onUnselect
	}: {
		facet: Facet;
		selected: string[];

		onSelect: (value: FacetItem) => void;
		onUnselect: (value: FacetItem) => void;
	} = $props();

	let showAll: boolean = $state(false);
	function toggleShowAll() {
		showAll = !showAll;
	}

	let searchQuery: string = $state('');
	let visibleValues = $derived.by(() => {
		if (searchQuery) {
			return facet.items.filter((item) =>
				item.name.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		if (!showAll) {
			return facet.items.slice(0, 5);
		}

		return facet.items;
	});
</script>

<details class="dropdown dropdown-center">
	<summary class="btn flex w-58 items-center justify-start gap-2">
		{facet.name} ({facet.items.length})
		<span class="flex-grow"></span>
		<i class="icon-[mdi--chevron-down] text-xl"></i>
	</summary>
	<ul class="dropdown-content menu bg-base-100 rounded-box w-full p-2 shadow">
		<li>
			<input
				type="text"
				placeholder="Search..."
				class="input input-bordered mb-2 w-full"
				bind:value={searchQuery}
			/>
		</li>
		{#each visibleValues as item (item.key)}
			<li>
				<label class="flex items-center">
					<input
						type="checkbox"
						class="checkbox checkbox-secondary"
						checked={selected.includes(item.key)}
						onchange={(e) => {
							const isSelected = e.currentTarget.checked;
							if (isSelected) {
								onSelect(item);
							} else {
								onUnselect(item);
							}
						}}
					/>
					<span class="ml-2">{item.name} ({item.count})</span>
				</label>
			</li>
		{/each}
		{#if searchQuery == ''}
			<li>
				<button type="button" class="btn btn-link w-full" onclick={() => toggleShowAll()}>
					{showAll ? 'Show Less' : 'See All'}
				</button>
			</li>
		{/if}
	</ul>
</details>
