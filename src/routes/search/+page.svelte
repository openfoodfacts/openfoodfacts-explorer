<script lang="ts">
	import { slide } from 'svelte/transition';
	import { tracker } from '$lib/matomo';

	import { navigating, page } from '$app/state';
	import { beforeNavigate, goto } from '$app/navigation';
	import { onDestroy } from 'svelte';

	import { _ } from '$lib/i18n';
	import { preferences } from '$lib/settings';
	import { SORT_OPTIONS } from '$lib/const';
	import {
		addExcludeFacet,
		addIncludeFacet,
		extractQuery,
		parseLuceneFacets,
		removeExcludeFacet,
		removeIncludeFacet,
		toLuceneString,
		toggleExcludeFacet,
		toggleIncludeFacet,
		type FacetsSelection
	} from '$lib/facets';
	import { personalizedSearch, type AttributeGroup } from '$lib/stores/preferencesStore';
	import { personalizeSearchResults } from '$lib/productScoring';
	import Pagination from '$lib/Pagination.svelte';
	import Metadata from '$lib/Metadata.svelte';
	import SearchOptionsFooter from '$lib/ui/SearchOptionsFooter.svelte';
	import VegaChart from '$lib/ui/VegaChart.svelte';
	import PreferencesForm from '$lib/ui/preferences/PreferencesForm.svelte';

	import IconMdiChevronDown from '@iconify-svelte/mdi/chevron-down';
	import IconMdiOpenInNew from '@iconify-svelte/mdi/open-in-new';
	import IconMdiChartBar from '@iconify-svelte/mdi/chart-bar';
	import IconMdiCog from '@iconify-svelte/mdi/cog';
	import IconMdiDatabase from '@iconify-svelte/mdi/database';
	import IconMdiFilterVariant from '@iconify-svelte/mdi/filter-variant';

	import type { PageProps } from './$types';
	import FacetBar from './FacetBar.svelte';
	import Sidebar from '$lib/ui/Sidebar.svelte';
	import SearchFilters from './SearchFilters.svelte';
	import ActiveFiltersBar from './ActiveFiltersBar.svelte';
	import WcProductCard from '$lib/ui/WcProductCard.svelte';
	import type { SearchResult } from '$lib/api/search';

	let { data }: PageProps = $props();
	let { search: searchResult } = $derived(data);

	let sortedProducts = $derived.by(() => {
		if (!searchResult?.hits || searchResult.hits.length === 0 || !data.attributesByCode) return [];

		const associateAttributes = (p: SearchResult['hits'][number]) => ({
			product: p,
			attributes: data.attributesByCode[p.code] || []
		});

		const productsWithAttributes = searchResult.hits.map(associateAttributes);
		const personalizedResults = personalizeSearchResults(
			productsWithAttributes,
			$personalizedSearch.userPreferences,
			$personalizedSearch.classifyProductsEnabled
		);

		return personalizedResults.map(({ product, scoreData }) => ({
			product: product.product,
			scoreData
		}));
	});

	// State for showing/hiding graphs
	let showGraphs = $state(false);

	// State for showing/hiding preferences
	let showPreferences = $state(false);

	// State for showing/hiding advanced options panel
	let showAdvancedOptions = $state(false);

	// Update facets when search results change or facetBarComponent changes
	$effect(() => {
		// Track search queries that return no results
		if (searchResult.count == 0) $tracker.trackEvent('Product Search', 'No Results', data.query);
	});

	let selectedSort = $derived.by(() => {
		const url = new URL(page.url);
		const sortValue = url.searchParams.get('sort_by') || '-unique_scans_n';
		return SORT_OPTIONS.find((opt) => opt.value === sortValue) || SORT_OPTIONS[0];
	});

	let sortDropdown: HTMLDetailsElement | null = $state(null);

	function getSelectedSortLabel() {
		return selectedSort.label;
	}

	function handleSortChange(value: string) {
		if (sortDropdown) sortDropdown.open = false; // Close the dropdown

		const nextSort = SORT_OPTIONS.find((opt) => opt.value === value) || SORT_OPTIONS[0];
		const newUrl = new URL(page.url);
		newUrl.searchParams.set('sort_by', nextSort.value);
		goto(newUrl.toString());
	}

	// Local state for UI facet toggling, synced with data.query from server
	// eslint-disable-next-line svelte/prefer-writable-derived
	let localFacets = $state<FacetsSelection>({});

	$effect(() => {
		localFacets = parseLuceneFacets(data.query);
	});

	let totalActiveFilters = $derived.by(() => {
		let count = 0;
		for (const sel of Object.values(localFacets)) {
			if (sel.include) count += sel.include.length;
			if (sel.exclude) count += sel.exclude.length;
		}
		return count;
	});

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function clearPendingTimer() {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = null;
		}
	}

	beforeNavigate(() => {
		clearPendingTimer();
	});

	onDestroy(() => {
		clearPendingTimer();
	});

	function updateFacets(nextFacets: FacetsSelection, immediate = false) {
		// Update local state immediately so UI (chips, badges, buttons) changes in 0ms
		localFacets = nextFacets;

		clearPendingTimer();

		const applyNavigation = () => {
			const mainQuery = extractQuery(data.query);
			const newQuery = toLuceneString(mainQuery, localFacets);
			const newUrl = new URL(page.url);
			newUrl.searchParams.set('q', newQuery);
			newUrl.searchParams.set('page', '1');

			if (newUrl.toString() !== page.url.toString()) {
				goto(newUrl.toString(), { keepFocus: true, noScroll: true, replaceState: true });
			}
		};

		if (immediate) {
			applyNavigation();
		} else {
			debounceTimer = setTimeout(applyNavigation, 3000);
		}
	}

	let mainSearchTerm = $derived(extractQuery(data.query));
	let cleanedQuery = $derived(mainSearchTerm.replace(/[\s-]/g, ''));
	let queryIsBarcode = $derived(/^\d{5,18}$/.test(cleanedQuery));
	let barcodeInput = $state('');
	let encodedMainSearchTerm = $derived(encodeURIComponent(mainSearchTerm));
	let sidebarHidden = $state(false);
</script>

<Metadata
	title={$_('search.title', { values: { query: data.query } })}
	description={$_('search.description', { values: { query: data.query } })}
/>

<!-- Superset SQL Promo Banner -->
<div
	class="my-4 alert border-base-300 alert-outline bg-linear-to-r from-primary/10 via-secondary/10 to-accent/10 max-md:hidden dark:from-primary/5 dark:via-secondary/5 dark:to-accent/5"
>
	<div class="shrink-0 rounded-lg bg-primary/15 p-2 text-primary">
		<IconMdiDatabase class="h-6 w-6" />
	</div>
	<div class="flex items-center gap-3">
		<div class="text-sm">
			<div class="font-bold text-primary">
				{$_('search.superset_promo_title', { default: 'Query OFF with SQL' })}
			</div>
			<span class="text-base-content/90">
				{$_('search.superset_promo_desc', {
					default:
						'Unlock the power of open data! Explore the full Open Food Facts database using SQL queries, custom charts, and shared dashboards.'
				})}
			</span>
		</div>
	</div>
	<div class="flex flex-wrap gap-2">
		<a
			href="https://sql.openfoodfacts.org/sqllab/"
			target="_blank"
			rel="noopener noreferrer"
			class="btn w-full btn-secondary btn-sm"
		>
			<IconMdiOpenInNew class="h-4 w-4 " />
			<span>{$_('search.superset_query', { default: 'Start a query' })}</span>
		</a>
		<a
			href="https://sql.openfoodfacts.org/superset/dashboard/p/njB1mRrxve2/"
			target="_blank"
			rel="noopener noreferrer"
			class="btn w-full btn-outline btn-sm"
		>
			<IconMdiOpenInNew class="h-4 w-4" />
			<span>{$_('search.superset_discover', { default: 'Documentation' })}</span>
		</a>
	</div>
</div>

<div class="mb-6 flex w-full flex-wrap items-center justify-between gap-4">
	<h2 class="text-xl font-bold text-base-content">
		{$_('search.results_for', {
			values: { term: mainSearchTerm },
			default: 'Search results for "{term}"'
		})}
	</h2>
	<div class="flex items-center gap-2">
		<!-- Sort By Dropdown -->
		<details class="dropdown relative dropdown-end shrink-0 open:z-50" bind:this={sortDropdown}>
			<summary
				class="sm:rounded-btn btn flex w-60 shrink-0 items-center justify-between gap-2 rounded-full btn-outline px-4 text-xs btn-sm sm:w-64 sm:text-sm"
			>
				<span class="truncate">{getSelectedSortLabel()}</span>
				<IconMdiChevronDown class="h-4 w-4 shrink-0" />
			</summary>
			<ul
				class="menu dropdown-content absolute top-full right-0 z-50 mt-1 w-60 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl sm:w-64"
			>
				{#each SORT_OPTIONS as { label, value } (value)}
					<li>
						<button
							class="w-full text-left leading-tight break-words whitespace-normal"
							onclick={() => handleSortChange(value)}
						>
							{$_(label)}
						</button>
					</li>
				{/each}
			</ul>
		</details>

		<!-- Advanced Options Toggle -->
		<button
			class="btn gap-2 btn-sm"
			class:btn-primary={showAdvancedOptions}
			class:btn-outline={!showAdvancedOptions}
			onclick={() => (showAdvancedOptions = !showAdvancedOptions)}
		>
			<IconMdiCog class="h-4 w-4" />
			<span>{$_('search.advanced_view', { default: 'Advanced Options' })}</span>
		</button>
	</div>
</div>

<!-- Advanced Options Panel (Collapsible) -->
{#if showAdvancedOptions}
	<div
		class="card mb-6 border border-base-300 bg-base-200/50 p-6 shadow-xs"
		transition:slide={{ duration: 300 }}
	>
		<!-- Content Column: Query info & Classic tools -->
		<div class="flex flex-col gap-5">
			<label class="form-control w-full">
				<span class="label-text mb-1 block text-sm font-semibold text-base-content/80">
					{$_('search.raw_query_label', { default: 'Raw Query' })}
				</span>
				<input
					type="text"
					class="input-bordered input w-full font-mono text-sm"
					value={data.query}
					disabled
					readonly
				/>
			</label>

			<div class="flex flex-col gap-2">
				<span class="text-sm font-semibold text-base-content/80">
					{$_('search.classic_tools', { default: 'Classic Tools:' })}
				</span>
				<div class="flex flex-wrap gap-2">
					<a
						href="https://world.openfoodfacts.org/cgi/search.pl?action=display&sort_by=unique_scans_n&page_size=20&graph=1&search_terms={encodedMainSearchTerm}"
						target="_blank"
						rel="noopener noreferrer"
						class="btn w-full btn-soft btn-sm md:w-fit"
					>
						{$_('search.generate_graphs_classic', {
							values: { term: mainSearchTerm },
							default: 'Generate graphs for {term} (classic version)'
						})}
						<IconMdiOpenInNew class="h-4 w-4" />
					</a>
					<a
						href="https://world.openfoodfacts.org/cgi/search.pl?action=display&sort_by=unique_scans_n&page_size=20&search_terms={encodedMainSearchTerm}"
						target="_blank"
						rel="noopener noreferrer"
						class="btn w-full btn-soft btn-sm md:w-fit"
					>
						{$_('search.advanced_search_classic', {
							values: { term: mainSearchTerm },
							default: 'Advanced Search for {term} (classic version)'
						})}
						<IconMdiOpenInNew class="h-4 w-4" />
					</a>
				</div>
			</div>

			{#if searchResult.charts && Object.keys(searchResult.charts).length > 0}
				<div class="flex flex-col gap-2">
					<span class="text-sm font-semibold text-base-content/80">
						{$_('search.charts_title', { default: 'Search Analytics' })}:
					</span>
					<button
						class="btn w-full gap-2 btn-secondary btn-sm md:w-fit"
						onclick={() => (showGraphs = !showGraphs)}
					>
						<IconMdiChartBar class="h-4 w-4" />
						{showGraphs
							? $_('search.hide_graphs', { default: 'Hide Graphs' })
							: $_('search.show_graphs', { default: 'Show Graphs' })}
					</button>
					{#if showGraphs}
						<div class="mt-2 grid grid-cols-1 gap-4" transition:slide={{ duration: 300 }}>
							{#each Object.entries(searchResult.charts) as [chartKey, chartSpec] (chartKey)}
								<div class="rounded-lg border border-base-200 bg-base-100 p-4 shadow-sm">
									<VegaChart
										spec={chartSpec}
										title={$_('search.chart_title', {
											values: { chartKey: chartKey.replace(/_/g, ' ').replace(':', ' vs ') },
											default: '{chartKey}'
										})}
									/>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Bottom Row: Edit Preferences & Personalization -->
		<div class="mt-6 flex flex-col gap-4 border-t border-base-300/60 pt-6">
			<label class="label cursor-pointer justify-start gap-4 p-0">
				<input
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={$personalizedSearch.classifyProductsEnabled}
				/>
				<div class="flex min-w-0 flex-1 flex-col">
					<span class="label-text text-sm font-semibold whitespace-normal">
						{$_('preferences.classify_products', {
							default: 'Enable Personalized Product Classification'
						})}
					</span>
					<span class="text-xs whitespace-normal text-base-content/60">
						{$_('preferences.classify_products_desc', {
							default: 'Enable personalized product classification based on your preferences.'
						})}
					</span>
				</div>
			</label>

			<div class="collapse-arrow collapse border border-base-300 bg-base-100">
				<input type="checkbox" bind:checked={showPreferences} />
				<div class="collapse-title flex items-center gap-2 text-sm font-medium">
					<IconMdiCog class="h-4 w-4" />
					{$_('preferences.edit_preferences')}
				</div>
				<div class="collapse-content">
					<PreferencesForm
						onClose={() => (showPreferences = false)}
						groups={data.attributeGroups as AttributeGroup[]}
					/>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Active Filters Bar -->
<ActiveFiltersBar
	selectedFacets={localFacets}
	facets={searchResult.facets}
	onRemoveInclude={(facetKey, val) => {
		const next = removeIncludeFacet(localFacets, facetKey, val);
		updateFacets(next);
	}}
	onRemoveExclude={(facetKey, val) => {
		const next = removeExcludeFacet(localFacets, facetKey, val);
		updateFacets(next);
	}}
	onClearAll={() => {
		updateFacets({}, true);
	}}
/>

<div
	class={[
		'relative w-full pb-[4.5rem] transition-all duration-300 lg:grid lg:gap-8',
		sidebarHidden ? 'lg:grid-cols-1' : 'lg:grid-cols-[auto_1fr]'
	]}
>
	<!-- Desktop Sidebar -->
	<Sidebar bind:hidden={sidebarHidden} type="search">
		{#snippet header()}
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-1.5">
					<IconMdiFilterVariant class="h-4 w-4 text-base-content/70" />
					<span class="text-xs font-bold tracking-wider text-base-content/70 uppercase">
						{$_('search.filters_title', { default: 'Filters' })}
					</span>
					{#if totalActiveFilters > 0}
						<span class="badge badge-xs font-semibold badge-primary">{totalActiveFilters}</span>
					{/if}
				</div>
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={() => (sidebarHidden = true)}
						class="cursor-pointer text-xs font-medium text-primary/70 underline transition-colors select-none hover:text-primary"
					>
						{$_('search.hide_sidebar', { default: 'Hide' })}
					</button>
				</div>
			</div>
		{/snippet}

		<SearchFilters
			facets={searchResult.facets}
			selectedFacets={localFacets}
			onToggleInclude={(key, val) => {
				const next = toggleIncludeFacet(localFacets, key, val);
				updateFacets(next);
			}}
			onToggleExclude={(key, val) => {
				const next = toggleExcludeFacet(localFacets, key, val);
				updateFacets(next);
			}}
			onAddInclude={(key, val) => {
				const next = addIncludeFacet(localFacets, key, val);
				updateFacets(next);
			}}
			onAddExclude={(key, val) => {
				const next = addExcludeFacet(localFacets, key, val);
				updateFacets(next);
			}}
			onRemoveInclude={(key, val) => {
				const next = removeIncludeFacet(localFacets, key, val);
				updateFacets(next);
			}}
			onRemoveExclude={(key, val) => {
				const next = removeExcludeFacet(localFacets, key, val);
				updateFacets(next);
			}}
		/>
	</Sidebar>

	<div class="flex w-full min-w-0 flex-col">
		<!-- Mobile/Tablet Facet Bar (Only visible on < lg) -->
		<div class="mt-2 mb-1 lg:hidden" id="facets">
			<FacetBar
				facets={searchResult.facets}
				selectedFacets={localFacets}
				onToggleInclude={(key, val) => {
					const next = toggleIncludeFacet(localFacets, key, val);
					updateFacets(next);
				}}
				onToggleExclude={(key, val) => {
					const next = toggleExcludeFacet(localFacets, key, val);
					updateFacets(next);
				}}
				onAddInclude={(key, val) => {
					const next = addIncludeFacet(localFacets, key, val);
					updateFacets(next);
				}}
				onAddExclude={(key, val) => {
					const next = addExcludeFacet(localFacets, key, val);
					updateFacets(next);
				}}
				onRemoveInclude={(key, val) => {
					const next = removeIncludeFacet(localFacets, key, val);
					updateFacets(next);
				}}
				onRemoveExclude={(key, val) => {
					const next = removeExcludeFacet(localFacets, key, val);
					updateFacets(next);
				}}
			/>
		</div>

		<div class="divider my-1 lg:hidden"></div>

		{#if navigating.to != null}
			<!-- Product Card Skeleton Loading State during API Call -->
			<div class="my-6 max-md:me-4">
				<div
					class={[
						'grid w-full grid-cols-1 gap-6 sm:grid-cols-2',
						sidebarHidden ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
					]}
				>
					{#each Array(6) as _, index (index)}
						<div
							class="flex h-44 w-full flex-col justify-between rounded-xl border border-base-300 bg-base-100 p-4 shadow-xs"
						>
							<div class="flex gap-4">
								<div class="h-24 w-24 shrink-0 skeleton rounded-lg"></div>
								<div class="flex flex-1 flex-col gap-2.5">
									<div class="h-4 w-3/4 skeleton rounded"></div>
									<div class="h-3 w-1/2 skeleton rounded"></div>
									<div class="h-3 w-1/3 skeleton rounded"></div>
								</div>
							</div>
							<div class="flex items-center justify-between pt-2">
								<div class="h-5 w-16 skeleton rounded-full"></div>
								<div class="h-5 w-20 skeleton rounded-full"></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else if searchResult.count > 0}
			<div class="max-md:me-4">
				<div
					class={[
						'mt-4 grid w-full grid-cols-1 gap-6 sm:grid-cols-2',
						sidebarHidden ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
					]}
				>
					{#each sortedProducts.filter(({ product }) => product.code != null) as { product, scoreData } (product.code)}
						<div class="indicator block w-full">
							{#if $preferences.displayPricesInSearch}
								<span class="indicator-item right-4 z-20 badge badge-sm badge-secondary">
									{$_('search.prices_badge', {
										values: { count: data.prices[product.code] }
									})}
								</span>
							{/if}
							<WcProductCard
								{product}
								personalScore={$personalizedSearch.classifyProductsEnabled ? scoreData : undefined}
							/>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="flex min-h-[50vh] w-full flex-col items-center justify-center p-4">
				{#if queryIsBarcode}
					<div class="card w-full max-w-lg bg-base-100 shadow-xl">
						<div class="card-body items-center p-8 text-center">
							<div class="mb-4 text-8xl grayscale-[20%]">🔍</div>
							<h1 class="text-3xl font-bold">
								{$_('search.product_not_found', { default: 'No products found' })}
							</h1>
							<p class="py-4 text-sm text-base-content/80 sm:text-base">
								{$_('qr.barcode_scanned_not_found', {
									values: { barcode: cleanedQuery },
									default: `Barcode ${cleanedQuery} was searched, but no product was found in our databases.`
								})}
							</p>
							<div class="mt-4 card-actions flex w-full flex-col gap-3">
								<a
									href="/products/{cleanedQuery}/edit"
									class="btn w-full font-bold text-primary-content shadow-md btn-lg btn-primary"
								>
									<span class="text-xl">➕</span>
									{$_('product.add_product', { default: 'Add This Product' })}
								</a>
							</div>
						</div>
					</div>
				{:else}
					<div class="card w-full max-w-lg bg-base-100 shadow-xl">
						<div class="card-body items-center p-8 text-center">
							<div class="mb-4 text-8xl grayscale-[20%]">🔍</div>
							<h1 class="text-3xl font-bold">
								{$_('search.product_not_found', { default: 'No products found' })}
							</h1>
							<p class="py-4 text-sm text-base-content/80 sm:text-base">
								{$_('search.product_not_found_desc', {
									default: "We couldn't find any products matching your search."
								})}
							</p>
							<div class="mt-4 card-actions flex w-full flex-col gap-3">
								<p class="text-xs text-base-content/60">
									{$_('product.edit.add_product_title', { default: 'Add a new product' })}: {$_(
										'search.enter_barcode_below',
										{ default: 'Enter the barcode below.' }
									)}
								</p>
								<form
									onsubmit={(e) => {
										e.preventDefault();
										const barcode = barcodeInput.trim();
										if (/^\d+$/.test(barcode)) {
											goto(`/products/${barcode}/edit`);
										}
									}}
									class="join w-full shadow-sm"
								>
									<input
										type="text"
										placeholder={$_('search.barcode_placeholder', {
											default: 'Barcode (e.g. 1234567890123)'
										})}
										bind:value={barcodeInput}
										class="input-bordered input join-item w-full focus:outline-none"
										required
										pattern="\d+"
										title={$_('search.barcode_validation_title', {
											default: 'Barcode must contain digits only'
										})}
									/>
									<button type="submit" class="btn join-item font-bold btn-primary">
										{$_('search.go', { default: 'Go' })}
									</button>
								</form>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<!-- Pagination -->
{#if navigating.to == null && searchResult.count > 0 && searchResult.page_count > 1}
	<div class="my-8 flex w-full justify-center">
		<Pagination
			page={searchResult.page}
			totalPages={searchResult.page_count}
			pageUrl={(p: number) => {
				const newUrl = new URL(page.url);
				newUrl.searchParams.set('page', p.toString());
				return newUrl.toString();
			}}
		/>
	</div>
{/if}

<!-- Sticky SORT & FILTER Footer -->
<SearchOptionsFooter
	onSortOptionSelect={(value) => handleSortChange(value)}
	sortBy={selectedSort.value}
	onFilterClick={() => {
		goto('/facets');
	}}
	{searchResult}
	selectedFacets={localFacets}
	onToggleInclude={(key, val) => {
		const next = toggleIncludeFacet(localFacets, key, val);
		updateFacets(next);
	}}
	onToggleExclude={(key, val) => {
		const next = toggleExcludeFacet(localFacets, key, val);
		updateFacets(next);
	}}
/>
