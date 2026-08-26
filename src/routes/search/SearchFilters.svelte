<script lang="ts">
	import { _ } from '$lib/i18n';
	import { SvelteSet } from 'svelte/reactivity';
	import type { Facet, FacetItem } from '$lib/api/search';
	import IconMdiChevronDown from '@iconify-svelte/mdi/chevron-down';
	import IconMdiPlus from '@iconify-svelte/mdi/plus';
	import IconMdiMinus from '@iconify-svelte/mdi/minus';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiMagnify from '@iconify-svelte/mdi/magnify';
	import {
		MASTER_FACET_CATALOG,
		FACET_CATEGORY_LABELS,
		computeFacetCollections,
		type FacetsSelection
	} from '$lib/facets';

	type Props = {
		facets?: Record<string, Facet>;
		selectedFacets?: FacetsSelection;
		onToggleInclude: (facetKey: string, itemKey: string) => void;
		onToggleExclude: (facetKey: string, itemKey: string) => void;
		onAddInclude: (facetKey: string, value: string) => void;
		onAddExclude: (facetKey: string, value: string) => void;
		onRemoveInclude: (facetKey: string, value: string) => void;
		onRemoveExclude: (facetKey: string, value: string) => void;
	};

	let {
		facets = {},
		selectedFacets = {},
		onToggleInclude,
		onToggleExclude,
		onAddInclude,
		onAddExclude,
		onRemoveInclude,
		onRemoveExclude
	}: Props = $props();

	let searchQueries = $state<Record<string, string>>({});
	let showAllFacets = $state<Record<string, boolean>>({});
	let customFacetKeys = $state<string[]>([]);
	let forcedOpenFacets = $state<Record<string, boolean>>({});

	// Add Filter dropdown state
	let addPickerQuery = $state('');
	let addPickerElement: HTMLDetailsElement | null = $state(null);
	let addPickerInput: HTMLInputElement | null = $state(null);

	const SCORE_FACET_KEYS = new Set(['nutrition_grades', 'environmental_score_grade', 'nova_group']);

	let collections = $derived(
		computeFacetCollections(facets, selectedFacets, customFacetKeys, addPickerQuery, (k, opt) =>
			$_(k, opt)
		)
	);

	let allFreeTextFacets = $derived(collections.allFreeTextFacets);
	let allAggregatedFacets = $derived(collections.allAggregatedFacets);
	let availableCatalogFacets = $derived(collections.availableCatalogFacets);
	let filteredCatalogFacets = $derived(collections.filteredCatalogFacets);
	let groupedCatalogFacets = $derived(collections.groupedCatalogFacets);

	function handleAddFacet(key: string) {
		if (!customFacetKeys.includes(key)) {
			customFacetKeys.push(key);
		}
		forcedOpenFacets[key] = true;
		if (addPickerElement) {
			addPickerElement.open = false;
		}
		addPickerQuery = '';
	}

	function handleRemoveFacet(key: string) {
		customFacetKeys = customFacetKeys.filter((k) => k !== key);
		delete forcedOpenFacets[key];
	}

	function handleToggleAddPicker() {
		if (addPickerElement?.open) {
			setTimeout(() => {
				addPickerInput?.focus();
			}, 50);
		} else {
			addPickerQuery = '';
		}
	}

	function getFacetDisplayName(key: string, facet?: Facet): string {
		const catalogItem = MASTER_FACET_CATALOG.find((f) => f.key === key);
		if (catalogItem) {
			const translated = $_(catalogItem.labelKey, { default: catalogItem.defaultLabel });
			if (translated) return translated;
		}
		const translated = $_(`facets.${key}`, { default: '' });
		if (translated) return translated;
		if (facet && facet.name && facet.name !== key) return facet.name;
		return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	function getFacetItems(facetKey: string, facet: Facet): FacetItem[] {
		const sel = selectedFacets[facetKey];
		const selectedInclude = sel?.include ?? [];
		const selectedExclude = sel?.exclude ?? [];

		const existingKeys = new SvelteSet(facet.items.map((i) => i.key));
		const missingActive: FacetItem[] = [];

		for (const key of selectedInclude) {
			if (!existingKeys.has(key)) {
				missingActive.push({ key, name: key, count: 0, selected: false });
				existingKeys.add(key);
			}
		}

		for (const key of selectedExclude) {
			if (!existingKeys.has(key)) {
				missingActive.push({ key, name: key, count: 0, selected: false });
				existingKeys.add(key);
			}
		}

		const items = [...missingActive, ...facet.items];
		items.sort((a, b) => {
			const aActive = selectedInclude.includes(a.key) || selectedExclude.includes(a.key);
			const bActive = selectedInclude.includes(b.key) || selectedExclude.includes(b.key);
			if (aActive && !bActive) return -1;
			if (!aActive && bActive) return 1;
			return 0;
		});

		const query = (searchQueries[facetKey] || '').toLowerCase().trim();
		if (query) {
			return items.filter((i) => i.name.toLowerCase().includes(query));
		}

		if (showAllFacets[facetKey] || SCORE_FACET_KEYS.has(facetKey)) {
			return items;
		}

		const activeCount = items.filter(
			(item) => selectedInclude.includes(item.key) || selectedExclude.includes(item.key)
		).length;
		const limit = Math.max(5, activeCount);
		return items.slice(0, limit);
	}
</script>

<!-- Aggregated Facets -->
{#each Object.entries(allAggregatedFacets) as [facetKey, facet] (facetKey)}
	{@const sel = selectedFacets[facetKey]}
	{@const selectedInclude = sel?.include ?? []}
	{@const selectedExclude = sel?.exclude ?? []}
	{@const activeCount = selectedInclude.length + selectedExclude.length}
	{@const visibleItems = getFacetItems(facetKey, facet)}
	{@const isExpanded = showAllFacets[facetKey] ?? false}
	{@const isScoreFacet = SCORE_FACET_KEYS.has(facetKey)}
	{@const displayName = getFacetDisplayName(facetKey, facet)}

	<details
		class="group mb-1 rounded-md border-b border-base-300/40 pb-1 transition-colors last:mb-0 last:border-b-0 last:pb-0"
		open={forcedOpenFacets[facetKey] ?? activeCount > 0}
		ontoggle={(e) => {
			forcedOpenFacets[facetKey] = e.currentTarget.open;
		}}
	>
		<summary
			title={displayName}
			class="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm font-semibold text-base-content transition-all duration-150 select-none group-open:bg-base-200/50 group-open:text-primary hover:bg-base-200/60"
		>
			<div class="flex min-w-0 items-center gap-1.5 pr-1.5">
				<span class="truncate" title={displayName}>{displayName}</span>
				<span class="text-xs font-normal opacity-55">({facet.items.length})</span>
				{#if activeCount > 0}
					<span class="ml-0.5 badge h-4 min-h-4 px-1.5 badge-xs text-[10px] font-bold badge-primary"
						>{activeCount}</span
					>
				{/if}
			</div>
			<div class="flex items-center gap-1">
				<IconMdiChevronDown
					class="h-4 w-4 shrink-0 opacity-70 transition-transform duration-200 group-open:rotate-180"
				/>
			</div>
		</summary>

		<div class="mt-1 flex flex-col gap-1 px-0.5 pt-0.5 pb-1">
			{#if customFacetKeys.includes(facetKey) && activeCount === 0}
				<div class="flex justify-end pb-1">
					<button
						type="button"
						class="btn h-5 min-h-5 gap-1 btn-ghost text-[11px] text-base-content/50 btn-xs hover:text-error"
						onclick={() => handleRemoveFacet(facetKey)}
						title={$_('search.remove_filter_section', { default: 'Hide this filter' })}
						aria-label={$_('search.remove_filter_section', { default: 'Hide this filter' })}
					>
						<IconMdiClose class="h-3 w-3" />
						<span>{$_('search.remove_filter_section', { default: 'Hide this filter' })}</span>
					</button>
				</div>
			{/if}
			{#if isScoreFacet}
				<!-- Horizontal badges for score facets (Nutri-Score, NOVA, Eco-Score) -->
				<div class="flex flex-wrap gap-1.5 py-1">
					{#each visibleItems as item (item.key)}
						{@const isIncluded = selectedInclude.includes(item.key)}
						{@const isExcluded = selectedExclude.includes(item.key)}
						<div class="join shrink-0 overflow-hidden rounded-md border border-base-300 shadow-2xs">
							<!-- Exclude (-) Button -->
							<button
								type="button"
								class="btn join-item h-6 min-h-6 border-none px-1.5 transition-colors btn-xs"
								class:btn-error={isExcluded}
								class:bg-base-200={!isExcluded}
								class:text-base-content={!isExcluded}
								onclick={() => onToggleExclude(facetKey, item.key)}
								aria-label={isExcluded
									? $_('search.remove_exclude', { default: 'Remove exclude filter' })
									: $_('search.exclude_item', {
											values: { name: item.name },
											default: `Exclude (NOT) ${item.name}`
										})}
								title={isExcluded
									? $_('search.remove_exclude', { default: 'Remove exclude filter' })
									: $_('search.exclude_item', {
											values: { name: item.name },
											default: `Exclude (NOT) ${item.name}`
										})}
							>
								<IconMdiMinus class="h-3 w-3" />
							</button>

							<!-- Grade label (clicking toggles include) -->
							<button
								type="button"
								class="btn join-item h-6 min-h-6 border-none bg-base-200 px-2 text-xs font-bold text-base-content uppercase transition-all btn-xs hover:bg-base-300"
								onclick={() => onToggleInclude(facetKey, item.key)}
								title={isIncluded
									? $_('search.remove_include', { default: 'Remove include filter' })
									: $_('search.include_item', {
											values: { name: item.name },
											default: `Include ${item.name}`
										})}
							>
								<span>{item.name.toUpperCase()}</span>
								<span class="ml-1 text-[10px] font-normal text-base-content/60">({item.count})</span
								>
							</button>

							<!-- Include (+) Button -->
							<button
								type="button"
								class="btn join-item h-6 min-h-6 border-none px-1.5 transition-colors btn-xs"
								class:btn-success={isIncluded}
								class:bg-base-200={!isIncluded}
								class:text-base-content={!isIncluded}
								onclick={() => onToggleInclude(facetKey, item.key)}
								aria-label={isIncluded
									? $_('search.remove_include', { default: 'Remove include filter' })
									: $_('search.include_item', {
											values: { name: item.name },
											default: `Include ${item.name}`
										})}
								title={isIncluded
									? $_('search.remove_include', { default: 'Remove include filter' })
									: $_('search.include_item', {
											values: { name: item.name },
											default: `Include ${item.name}`
										})}
							>
								<IconMdiPlus class="h-3 w-3" />
							</button>
						</div>
					{/each}
				</div>
			{:else}
				<!-- Search within facet -->
				<div class="relative mb-2">
					<IconMdiMagnify class="absolute top-2 left-2 h-3.5 w-3.5 text-base-content/40" />
					<input
						type="text"
						placeholder={$_('search.filter_placeholder', { default: 'Filter...' })}
						class="input-bordered input w-full rounded-md bg-base-100 pl-7 text-xs input-xs"
						bind:value={searchQueries[facetKey]}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								const q = (searchQueries[facetKey] || '').trim();
								if (q) {
									e.preventDefault();
									onAddInclude(facetKey, q);
									searchQueries[facetKey] = '';
								}
							}
						}}
					/>
					{#if searchQueries[facetKey]}
						<button
							type="button"
							class="absolute top-1.5 right-1.5 text-base-content/50 hover:text-base-content"
							onclick={() => (searchQueries[facetKey] = '')}
							title={$_('search.clear_search', { default: 'Clear search' })}
							aria-label={$_('search.clear_search', { default: 'Clear search' })}
						>
							<IconMdiClose class="h-3 w-3" />
						</button>
					{/if}
				</div>

				<!-- Items list -->
				<ul class="flex flex-col gap-0.5">
					{#each visibleItems as item (item.key)}
						{@const isIncluded = selectedInclude.includes(item.key)}
						{@const isExcluded = selectedExclude.includes(item.key)}
						<li
							class="flex items-center justify-between gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:bg-base-200/60"
						>
							<!-- Exclude (-) Button on left -->
							<button
								type="button"
								class="btn h-6 min-h-6 w-6 shrink-0 rounded-md border border-base-300 p-0 transition-colors btn-xs"
								class:btn-error={isExcluded}
								class:bg-base-200={!isExcluded}
								class:text-base-content={!isExcluded}
								onclick={() => onToggleExclude(facetKey, item.key)}
								aria-label={isExcluded
									? $_('search.remove_exclude', { default: 'Remove exclude filter' })
									: $_('search.exclude_item', {
											values: { name: item.name },
											default: `Exclude (NOT) ${item.name}`
										})}
								title={isExcluded
									? $_('search.remove_exclude', { default: 'Remove exclude filter' })
									: $_('search.exclude_item', {
											values: { name: item.name },
											default: `Exclude (NOT) ${item.name}`
										})}
							>
								<IconMdiMinus class="h-3.5 w-3.5" />
							</button>

							<!-- Item name and count in middle -->
							<span
								class="min-w-0 flex-1 text-center text-xs leading-tight font-medium break-words whitespace-normal text-base-content"
								title={item.name}
							>
								{item.name}
								<span class="text-[10px] text-base-content/50">({item.count})</span>
							</span>

							<!-- Include (+) Button on right -->
							<button
								type="button"
								class="btn h-6 min-h-6 w-6 shrink-0 rounded-md border border-base-300 p-0 transition-colors btn-xs"
								class:btn-success={isIncluded}
								class:bg-base-200={!isIncluded}
								class:text-base-content={!isIncluded}
								onclick={() => onToggleInclude(facetKey, item.key)}
								aria-label={isIncluded
									? $_('search.remove_include', { default: 'Remove include filter' })
									: $_('search.include_item', {
											values: { name: item.name },
											default: `Include ${item.name}`
										})}
								title={isIncluded
									? $_('search.remove_include', { default: 'Remove include filter' })
									: $_('search.include_item', {
											values: { name: item.name },
											default: `Include ${item.name}`
										})}
							>
								<IconMdiPlus class="h-3.5 w-3.5" />
							</button>
						</li>
					{:else}
						{#if searchQueries[facetKey]}
							{@const currentInput = searchQueries[facetKey].trim()}
							<li
								class="flex items-center justify-between gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:bg-base-200/60"
							>
								<!-- Exclude (-) Button on left -->
								<button
									type="button"
									class="btn h-6 min-h-6 w-6 shrink-0 rounded-md border border-base-300 p-0 transition-colors btn-error btn-xs"
									onclick={() => {
										onAddExclude(facetKey, currentInput);
										searchQueries[facetKey] = '';
									}}
									title={$_('search.exclude_item', {
										values: { name: currentInput },
										default: `Exclude (NOT) ${currentInput}`
									})}
									aria-label={$_('search.exclude_item', {
										values: { name: currentInput },
										default: `Exclude (NOT) ${currentInput}`
									})}
								>
									<IconMdiMinus class="h-3.5 w-3.5" />
								</button>

								<!-- Query in middle -->
								<span
									class="min-w-0 flex-1 text-center text-xs leading-tight font-medium break-words whitespace-normal text-base-content"
									title={currentInput}
								>
									{currentInput}
								</span>

								<!-- Include (+) Button on right -->
								<button
									type="button"
									class="btn h-6 min-h-6 w-6 shrink-0 rounded-md border border-base-300 p-0 transition-colors btn-success btn-xs"
									onclick={() => {
										onAddInclude(facetKey, currentInput);
										searchQueries[facetKey] = '';
									}}
									title={$_('search.include_item', {
										values: { name: currentInput },
										default: `Include ${currentInput}`
									})}
									aria-label={$_('search.include_item', {
										values: { name: currentInput },
										default: `Include ${currentInput}`
									})}
								>
									<IconMdiPlus class="h-3.5 w-3.5" />
								</button>
							</li>
						{:else}
							<li class="py-1 text-center text-xs text-base-content/50">
								{$_('search.no_matching_items', { default: 'No matching items' })}
							</li>
						{/if}
					{/each}
				</ul>

				<!-- Show more / less -->
				{#if facet.items.length > 5}
					<button
						type="button"
						class="btn mt-1 btn-ghost text-xs text-primary btn-xs"
						onclick={() => (showAllFacets[facetKey] = !isExpanded)}
					>
						{#if isExpanded}
							{$_('search.show_less', { default: 'Show less' })}
						{:else}
							{$_('search.see_all_count', {
								values: { count: facet.items.length },
								default: `See all (${facet.items.length})`
							})}
						{/if}
					</button>
				{/if}
			{/if}
		</div>
	</details>
{/each}

<!-- Free-Text Filter Sections (Origins, Manufacturing Places, EMB Codes, etc.) -->
{#each allFreeTextFacets as freeFacet (freeFacet.key)}
	{@const sel = selectedFacets[freeFacet.key]}
	{@const selectedInclude = sel?.include ?? []}
	{@const selectedExclude = sel?.exclude ?? []}
	{@const activeCount = selectedInclude.length + selectedExclude.length}
	{@const freeLabel = $_(freeFacet.labelKey, { default: freeFacet.defaultLabel })}

	<details
		class="group mb-1 rounded-md border-b border-base-300/40 pb-1 transition-colors last:mb-0 last:border-b-0 last:pb-0"
		open={forcedOpenFacets[freeFacet.key] ?? activeCount > 0}
		ontoggle={(e) => {
			forcedOpenFacets[freeFacet.key] = e.currentTarget.open;
		}}
	>
		<summary
			title={freeLabel}
			class="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm font-semibold text-base-content transition-all duration-150 select-none group-open:bg-base-200/50 group-open:text-primary hover:bg-base-200/60"
		>
			<div class="flex min-w-0 items-center gap-1.5 pr-1.5">
				<span class="truncate" title={freeLabel}>{freeLabel}</span>
				{#if activeCount > 0}
					<span class="ml-0.5 badge h-4 min-h-4 px-1.5 badge-xs text-[10px] font-bold badge-primary"
						>{activeCount}</span
					>
				{/if}
			</div>
			<div class="flex items-center gap-1">
				<IconMdiChevronDown
					class="h-4 w-4 shrink-0 opacity-70 transition-transform duration-200 group-open:rotate-180"
				/>
			</div>
		</summary>

		<div class="mt-1 flex flex-col gap-1 px-0.5 pt-0.5 pb-1">
			{#if customFacetKeys.includes(freeFacet.key) && activeCount === 0}
				<div class="flex justify-end pb-1">
					<button
						type="button"
						class="btn h-5 min-h-5 gap-1 btn-ghost text-[11px] text-base-content/50 btn-xs hover:text-error"
						onclick={() => handleRemoveFacet(freeFacet.key)}
						title={$_('search.remove_filter_section', { default: 'Hide this filter' })}
						aria-label={$_('search.remove_filter_section', { default: 'Hide this filter' })}
					>
						<IconMdiClose class="h-3 w-3" />
						<span>{$_('search.remove_filter_section', { default: 'Hide this filter' })}</span>
					</button>
				</div>
			{/if}

			<!-- Search within facet -->
			<div class="relative mb-2">
				<IconMdiMagnify class="absolute top-2 left-2 h-3.5 w-3.5 text-base-content/40" />
				<input
					type="text"
					placeholder={freeFacet.placeholderKey
						? $_(freeFacet.placeholderKey, {
								default: freeFacet.defaultPlaceholder || freeFacet.placeholder
							})
						: freeFacet.placeholder || $_('search.filter_placeholder', { default: 'Filter...' })}
					class="input-bordered input w-full rounded-md bg-base-100 pl-7 text-xs input-xs"
					bind:value={searchQueries[freeFacet.key]}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							const q = (searchQueries[freeFacet.key] || '').trim();
							if (q) {
								e.preventDefault();
								onAddInclude(freeFacet.key, q);
								searchQueries[freeFacet.key] = '';
							}
						}
					}}
				/>
				{#if searchQueries[freeFacet.key]}
					<button
						type="button"
						class="absolute top-1.5 right-1.5 text-base-content/50 hover:text-base-content"
						onclick={() => (searchQueries[freeFacet.key] = '')}
						aria-label={$_('search.clear_search', { default: 'Clear search' })}
					>
						<IconMdiClose class="h-3 w-3" />
					</button>
				{/if}
			</div>

			<!-- Dynamic suggestion action buttons when typing -->
			{#if (searchQueries[freeFacet.key] || '').trim()}
				{@const currentInput = (searchQueries[freeFacet.key] || '').trim()}
				<div
					class="mb-1 flex items-center justify-between gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:bg-base-200/60"
				>
					<!-- Exclude (-) Button on left -->
					<button
						type="button"
						class="btn h-6 min-h-6 w-6 shrink-0 rounded-md border border-base-300 p-0 transition-colors btn-error btn-xs"
						onclick={() => {
							onAddExclude(freeFacet.key, currentInput);
							searchQueries[freeFacet.key] = '';
						}}
						title={$_('search.exclude_item', {
							values: { name: currentInput },
							default: `Exclude (NOT) ${currentInput}`
						})}
						aria-label={$_('search.exclude_item', {
							values: { name: currentInput },
							default: `Exclude (NOT) ${currentInput}`
						})}
					>
						<IconMdiMinus class="h-3.5 w-3.5" />
					</button>

					<!-- Query in middle -->
					<span
						class="min-w-0 flex-1 text-center text-xs leading-tight font-medium break-words whitespace-normal text-base-content"
						title={currentInput}
					>
						{currentInput}
					</span>

					<!-- Include (+) Button on right -->
					<button
						type="button"
						class="btn h-6 min-h-6 w-6 shrink-0 rounded-md border border-base-300 p-0 transition-colors btn-success btn-xs"
						onclick={() => {
							onAddInclude(freeFacet.key, currentInput);
							searchQueries[freeFacet.key] = '';
						}}
						title={$_('search.include_item', {
							values: { name: currentInput },
							default: `Include ${currentInput}`
						})}
						aria-label={$_('search.include_item', {
							values: { name: currentInput },
							default: `Include ${currentInput}`
						})}
					>
						<IconMdiPlus class="h-3.5 w-3.5" />
					</button>
				</div>
			{/if}

			<!-- Items list matching standard facets -->
			{#if activeCount > 0}
				{@const allValues = Array.from(new Set([...selectedInclude, ...selectedExclude]))}
				<ul class="flex flex-col gap-0.5">
					{#each allValues as val (val)}
						{@const isIncluded = selectedInclude.includes(val)}
						{@const isExcluded = selectedExclude.includes(val)}
						<li
							class="flex items-center justify-between gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:bg-base-200/60"
						>
							<!-- Exclude (-) Button on left -->
							<button
								type="button"
								class="btn h-6 min-h-6 w-6 shrink-0 rounded-md border border-base-300 p-0 transition-colors btn-xs"
								class:btn-error={isExcluded}
								class:bg-base-200={!isExcluded}
								class:text-base-content={!isExcluded}
								onclick={() => {
									if (isExcluded) {
										onRemoveExclude(freeFacet.key, val);
									} else {
										if (isIncluded) onRemoveInclude(freeFacet.key, val);
										onAddExclude(freeFacet.key, val);
									}
								}}
								aria-label={isExcluded
									? $_('search.remove_exclude', { default: 'Remove exclude filter' })
									: $_('search.exclude_item', {
											values: { name: val },
											default: `Exclude (NOT) ${val}`
										})}
								title={isExcluded
									? $_('search.remove_exclude', { default: 'Remove exclude filter' })
									: $_('search.exclude_item', {
											values: { name: val },
											default: `Exclude (NOT) ${val}`
										})}
							>
								<IconMdiMinus class="h-3.5 w-3.5" />
							</button>

							<!-- Item name in middle -->
							<span
								class="min-w-0 flex-1 text-center text-xs leading-tight font-medium break-words whitespace-normal text-base-content"
								title={val}
							>
								{val}
							</span>

							<!-- Include (+) Button on right -->
							<button
								type="button"
								class="btn h-6 min-h-6 w-6 shrink-0 rounded-md border border-base-300 p-0 transition-colors btn-xs"
								class:btn-success={isIncluded}
								class:bg-base-200={!isIncluded}
								class:text-base-content={!isIncluded}
								onclick={() => {
									if (isIncluded) {
										onRemoveInclude(freeFacet.key, val);
									} else {
										if (isExcluded) onRemoveExclude(freeFacet.key, val);
										onAddInclude(freeFacet.key, val);
									}
								}}
								aria-label={isIncluded
									? $_('search.remove_include', { default: 'Remove include filter' })
									: $_('search.include_item', {
											values: { name: val },
											default: `Include ${val}`
										})}
								title={isIncluded
									? $_('search.remove_include', { default: 'Remove include filter' })
									: $_('search.include_item', {
											values: { name: val },
											default: `Include ${val}`
										})}
							>
								<IconMdiPlus class="h-3.5 w-3.5" />
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</details>
{/each}

<!-- Add Facet Collapsible Section -->
{#if availableCatalogFacets.length > 0}
	<details
		class="group mb-1 rounded-md border-b border-base-300/40 pb-1 transition-colors last:mb-0 last:border-b-0 last:pb-0"
		bind:this={addPickerElement}
		ontoggle={handleToggleAddPicker}
	>
		<summary
			title={$_('search.add_facet_button', { default: 'Add facet' })}
			class="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm font-semibold text-base-content transition-all duration-150 select-none group-open:bg-base-200/50 group-open:text-primary hover:bg-base-200/60"
		>
			<div class="flex min-w-0 items-center gap-1.5 pr-1.5">
				<span class="truncate" title={$_('search.add_facet_button', { default: 'Add facet' })}
					>{$_('search.add_facet_button', { default: 'Add facet' })}</span
				>
				<span class="text-xs font-normal opacity-55">({availableCatalogFacets.length})</span>
			</div>
			<IconMdiChevronDown
				class="h-4 w-4 shrink-0 opacity-70 transition-transform duration-200 group-open:rotate-180"
			/>
		</summary>

		<div class="mt-1 flex flex-col gap-1 px-0.5 pt-0.5 pb-1">
			<!-- Search filter input -->
			<div class="relative mb-2">
				<IconMdiMagnify class="absolute top-2 left-2 h-3.5 w-3.5 text-base-content/40" />
				<input
					bind:this={addPickerInput}
					type="text"
					placeholder={$_('search.search_available_facets', {
						default: 'Filter available facets...'
					})}
					class="input-bordered input w-full rounded-md bg-base-100 pl-7 text-xs input-xs"
					bind:value={addPickerQuery}
				/>
				{#if addPickerQuery}
					<button
						type="button"
						class="absolute top-1.5 right-1.5 text-base-content/50 hover:text-base-content"
						onclick={() => (addPickerQuery = '')}
						aria-label={$_('search.clear_search', { default: 'Clear search' })}
					>
						<IconMdiClose class="h-3.5 w-3.5" />
					</button>
				{/if}
			</div>

			<!-- Facets List Grouped by Category -->
			<div class="max-h-60 scrollbar-thin overflow-y-auto pr-0.5">
				{#if filteredCatalogFacets.length === 0}
					<div class="py-2 text-center text-xs text-base-content/50">
						{$_('search.no_matching_facets', { default: 'No matching facets' })}
					</div>
				{:else}
					{#each Object.entries(groupedCatalogFacets) as [category, items] (category)}
						{@const categoryMeta = FACET_CATEGORY_LABELS[
							category as keyof typeof FACET_CATEGORY_LABELS
						] || {
							labelKey: `facets.category_${category.toLowerCase()}`,
							defaultLabel: category
						}}
						<div class="mb-2 last:mb-0">
							<div class="px-1 py-0.5 text-[10px] font-semibold text-base-content/50 uppercase">
								{$_(categoryMeta.labelKey, { default: categoryMeta.defaultLabel })}
							</div>
							<ul class="flex flex-col gap-0.5">
								{#each items as item (item.key)}
									{@const ItemIcon = item.icon}
									<li>
										<button
											type="button"
											class="flex w-full cursor-pointer items-center justify-between gap-1.5 rounded-md px-1.5 py-1 text-xs font-medium text-base-content transition-colors hover:bg-primary/10 hover:text-primary"
											onclick={() => handleAddFacet(item.key)}
										>
											<div class="flex items-center gap-1.5 truncate">
												<ItemIcon class="h-3.5 w-3.5 shrink-0 opacity-70" />
												<span class="truncate">
													{$_(item.labelKey, { default: item.defaultLabel })}
												</span>
											</div>
											<IconMdiPlus class="h-3.5 w-3.5 shrink-0 text-primary" />
										</button>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</details>
{/if}
