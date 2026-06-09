<script lang="ts">
	import { slide } from 'svelte/transition';
	import { tracker } from '$lib/matomo';

	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	import { _ } from '$lib/i18n';
	import { preferences } from '$lib/settings';
	import { SORT_OPTIONS } from '$lib/const';
	import {
		addIncludeFacet,
		extractQuery,
		removeIncludeFacet,
		toLuceneString,
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

	import type { PageProps } from './$types';
	import FacetBar from './FacetBar.svelte';
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

	// State to hold selected facets
	//  { key1 => { include: ['value1', 'value2'], exclude: ['value3'] } }
	let selectedFacets: FacetsSelection = $derived.by(() => {
		const entries = Object.entries(searchResult.facets).map(([key, facet]) => {
			const selectedItems = facet.items.filter((item) => item.selected).map((item) => item.key);
			return [key, { include: selectedItems, exclude: [] }];
		});
		return Object.fromEntries(entries);
	});

	function refreshQuery() {
		// recreate the full lucene query with selected facets
		const mainQuery = extractQuery(data.query);
		const newQuery = toLuceneString(mainQuery, selectedFacets);

		const newUrl = new URL(page.url);
		newUrl.searchParams.set('q', newQuery);
		goto(newUrl.toString());
	}

	let mainSearchTerm = $derived(extractQuery(data.query));
	let cleanedQuery = $derived(mainSearchTerm.replace(/[\s-]/g, ''));
	let queryIsBarcode = $derived(/^\d{5,18}$/.test(cleanedQuery));
	let barcodeInput = $state('');
</script>

<Metadata
	title={$_('search.title', { values: { query: data.query } })}
	description={$_('search.description', { values: { query: data.query } })}
/>

<!-- Superset SQL Promo Banner -->
<div
	class="alert alert-outline bg-linear-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 dark:from-orange-500/5 dark:via-amber-500/5 dark:to-yellow-500/5 border-amber-500/20 my-4 max-md:hidden"
>
	<div class="bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-lg p-2 shrink-0">
		<IconMdiDatabase class="h-6 w-6" />
	</div>
	<div class="flex items-center gap-3">
		<div class="text-sm">
			<div class="text-amber-800 dark:text-amber-300 font-bold">sql.openfoodfacts.org:</div>
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
			class="btn btn-secondary btn-sm w-full"
		>
			<IconMdiOpenInNew class="h-4 w-4 " />
			<span>{$_('search.superset_query', { default: 'Start a query' })}</span>
		</a>
		<a
			href="https://sql.openfoodfacts.org/superset/dashboard/p/njB1mRrxve2/"
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn-outline btn-sm w-full"
		>
			<IconMdiOpenInNew class="h-4 w-4" />
			<span>{$_('search.superset_discover', { default: 'Documentation' })}</span>
		</a>
	</div>
</div>

<div class="mb-6 flex w-full flex-wrap items-center justify-between gap-4">
	<h2 class="text-xl font-bold text-base-content">
		Search results for "{mainSearchTerm}"
	</h2>
	<div class="flex items-center gap-2">
		<!-- Sort By Dropdown -->
		<details class="dropdown dropdown-end" bind:this={sortDropdown}>
			<summary class="btn btn-outline btn-sm gap-2">
				<span>{getSelectedSortLabel()}</span>
				<IconMdiChevronDown class="h-4 w-4" />
			</summary>
			<ul
				class="dropdown-content menu bg-base-100 rounded-box z-1 w-56 p-2 shadow-md border border-base-300"
			>
				{#each SORT_OPTIONS as { label, value } (value)}
					<li>
						<button class="w-full text-left" onclick={() => handleSortChange(value)}>
							{$_(label)}
						</button>
					</li>
				{/each}
			</ul>
		</details>

		<!-- Advanced Options Toggle -->
		<button
			class="btn btn-sm gap-2"
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
		class="card bg-base-200/50 border-base-300 mb-6 border p-6 shadow-xs"
		transition:slide={{ duration: 300 }}
	>
		<!-- Content Column: Query info & Classic tools -->
		<div class="flex flex-col gap-5">
			<label class="form-control w-full">
				<span class="label-text mb-1 block text-sm font-semibold text-base-content/80">
					{$_('search.raw_query_label')}
				</span>
				<input
					type="text"
					class="input input-bordered w-full font-mono text-sm"
					value={data.query}
					disabled
					readonly
				/>
			</label>

			<div class="flex flex-col gap-2">
				<span class="text-sm font-semibold text-base-content/80">Classic Tools:</span>
				<div class="flex flex-wrap gap-2">
					<a
						href="https://world.openfoodfacts.org/cgi/search.pl?action=display&sort_by=unique_scans_n&page_size=20&graph=1&search_terms={mainSearchTerm}"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-soft btn-sm w-full md:w-fit"
					>
						{$_('search.generate_graphs_classic', { values: { term: mainSearchTerm } })}
						<IconMdiOpenInNew class="h-4 w-4" />
					</a>
					<a
						href="https://world.openfoodfacts.org/cgi/search.pl?action=display&sort_by=unique_scans_n&page_size=20&search_terms={mainSearchTerm}"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-soft btn-sm w-full md:w-fit"
					>
						{$_('search.advanced_search_classic', { values: { term: mainSearchTerm } })}
						<IconMdiOpenInNew class="h-4 w-4" />
					</a>
				</div>
			</div>

			{#if searchResult.charts && Object.keys(searchResult.charts).length > 0}
				<div class="flex flex-col gap-2">
					<span class="text-sm font-semibold text-base-content/80">Search Analytics:</span>
					<button
						class="btn btn-secondary btn-sm gap-2 w-full md:w-fit"
						onclick={() => (showGraphs = !showGraphs)}
					>
						<IconMdiChartBar class="h-4 w-4" />
						{showGraphs ? $_('search.hide_graphs') : $_('search.show_graphs')}
					</button>
					{#if showGraphs}
						<div class="grid grid-cols-1 gap-4 mt-2" transition:slide={{ duration: 300 }}>
							{#each Object.entries(searchResult.charts) as [chartKey, chartSpec] (chartKey)}
								<div class="bg-base-100 rounded-lg p-4 shadow-sm border border-base-200">
									<VegaChart
										spec={chartSpec}
										title={$_('search.chart_title', {
											values: { chartKey: chartKey.replace(/_/g, ' ').replace(':', ' vs ') }
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
		<div class="mt-6 border-t border-base-300/60 pt-6 flex flex-col gap-4">
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
					<span class="text-base-content/60 text-xs whitespace-normal">
						{$_('preferences.classify_products_desc', {
							default: 'Enable personalized product classification based on your preferences.'
						})}
					</span>
				</div>
			</label>

			<div class="collapse-arrow border-base-300 bg-base-100 collapse border">
				<input type="checkbox" bind:checked={showPreferences} />
				<div class="collapse-title text-sm flex items-center gap-2 font-medium">
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

<!-- Facet Bar -->
{#if searchResult.facets && Object.keys(searchResult.facets).length > 0}
	<div class="my-4" id="facets">
		<FacetBar
			facets={searchResult.facets}
			onAddFacet={(key, val) => {
				selectedFacets = addIncludeFacet(selectedFacets, key, val);
				refreshQuery();
			}}
			onRemoveFacet={(key, val) => {
				selectedFacets = removeIncludeFacet(selectedFacets, key, val);
				refreshQuery();
			}}
		/>
	</div>
{/if}

<div class="divider"></div>

{#if searchResult.count > 0}
	<div class="max-md:me-4">
		<div class="mt-4 grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each sortedProducts.filter(({ product }) => product.code != null) as { product, scoreData } (product.code)}
				<div class="indicator block w-full">
					{#if $preferences.displayPricesInSearch}
						<span class="indicator-item badge badge-secondary badge-sm right-4 z-20">
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

	<!-- Pagination -->
	<div class="mt-8">
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
{:else}
	<div class="flex min-h-[50vh] w-full flex-col items-center justify-center p-4">
		{#if queryIsBarcode}
			<div class="card bg-base-100 w-full max-w-lg shadow-xl">
				<div class="card-body items-center p-8 text-center">
					<div class="mb-4 text-8xl grayscale-[20%]">🔍</div>
					<h1 class="text-3xl font-bold">
						{$_('search.product_not_found', { default: 'No products found' })}
					</h1>
					<p class="text-base-content/80 py-4 text-sm sm:text-base">
						{$_('qr.barcode_scanned_not_found', {
							values: { barcode: cleanedQuery },
							default: `Barcode ${cleanedQuery} was searched, but no product was found in our databases.`
						})}
					</p>
					<div class="card-actions mt-4 flex w-full flex-col gap-3">
						<a
							href="/products/{cleanedQuery}/edit"
							class="btn btn-primary btn-lg text-primary-content w-full font-bold shadow-md"
						>
							<span class="text-xl">➕</span>
							{$_('product.add_product', { default: 'Add This Product' })}
						</a>
					</div>
				</div>
			</div>
		{:else}
			<div class="card bg-base-100 w-full max-w-lg shadow-xl">
				<div class="card-body items-center p-8 text-center">
					<div class="mb-4 text-8xl grayscale-[20%]">🔍</div>
					<h1 class="text-3xl font-bold">
						{$_('search.product_not_found', { default: 'No products found' })}
					</h1>
					<p class="text-base-content/80 py-4 text-sm sm:text-base">
						{$_('search.product_not_found_desc', {
							default: "We couldn't find any products matching your search."
						})}
					</p>
					<div class="card-actions mt-4 flex w-full flex-col gap-3">
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
								class="input join-item input-bordered w-full focus:outline-none"
								required
								pattern="\d+"
								title={$_('search.barcode_validation_title', {
									default: 'Barcode must contain digits only'
								})}
							/>
							<button type="submit" class="btn btn-primary join-item font-bold">
								{$_('search.go', { default: 'Go' })}
							</button>
						</form>
					</div>
				</div>
			</div>
		{/if}
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
	onAddFacet={(key, val) => {
		selectedFacets = addIncludeFacet(selectedFacets, key, val);
		refreshQuery();
	}}
	onRemoveFacet={(key, val) => {
		selectedFacets = removeIncludeFacet(selectedFacets, key, val);
		refreshQuery();
	}}
/>
