<script lang="ts">
	import { slide } from 'svelte/transition';
	import { tracker } from '@sinnwerkstatt/sveltekit-matomo';

	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';

	import { _ } from '$lib/i18n';
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
	import PreferencesForm from '$lib/ui/PreferencesForm.svelte';

	import type { PageProps } from './$types';
	import FacetBar from './FacetBar.svelte';

	let { data }: PageProps = $props();
	let { search: result } = $derived(data);

	let sortedProducts = $derived.by(() => {
		if (!result?.hits || result.hits.length === 0 || !data.attributesByCode) return [];

		const productsWithAttributes = result.hits.map((hit) => ({
			...hit,
			attributes: data.attributesByCode[hit.code] || []
		}));

		return personalizeSearchResults(
			productsWithAttributes,
			$personalizedSearch.userPreferences,
			$personalizedSearch.classifyProductsEnabled
		);
	});

	// State for showing/hiding graphs
	let showGraphs = $state(false);

	// State for showing/hiding preferences
	let showPreferences = $state(false);
	let showPrices = $state(true);

	// Update facets when search results change or facetBarComponent changes
	$effect(() => {
		// Track search queries that return no results
		if (result.count == 0) $tracker.trackEvent('Product Search', 'No Results', data.query);
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

		selectedSort = SORT_OPTIONS.find((opt) => opt.value === value) || SORT_OPTIONS[0];
		const newUrl = new URL(page.url);
		newUrl.searchParams.set('sort_by', selectedSort.value);
		goto(newUrl.toString());
	}

	// State to hold selected facets
	//  { key1 => { include: ['value1', 'value2'], exclude: ['value3'] } }
	let selectedFacets: FacetsSelection = $derived.by(() => {
		const entries = Object.entries(result.facets).map(([key, facet]) => {
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

	// Track which product is being navigated to
	let navigatingTo: string | null = $state(null);

	// Handle navigation to product page
	function navigateToProduct(barcode: string) {
		navigatingTo = barcode;
		goto(`/products/${barcode}`);
	}

	let mainSearchTerm = $derived(extractQuery(data.query));
</script>

<Metadata
	title={$_('search.title', { values: { query: data.query } })}
	description={$_('search.description', { values: { query: data.query } })}
/>

<div class="mb-4 flex w-full flex-wrap items-end justify-center gap-4 max-md:flex-col">
	<!-- Raw Search Query -->
	<div class="min-w-[220px] flex-1 max-md:w-full">
		<label class="form-control w-full">
			<span class="label-text mb-1 block text-sm font-semibold">
				{$_('search.raw_query_label')}
			</span>
			<input
				type="text"
				placeholder={$_('search.placeholder')}
				class="input input-bordered w-full font-mono break-words"
				value={data.query}
				disabled
				readonly
			/>
		</label>
	</div>

	<!-- Sort By Dropdown -->
	<div class="flex-0 max-lg:hidden">
		{$_('search.sort_by_label')}
		<details class="dropdown dropdown-center md:w-50 lg:w-60" bind:this={sortDropdown}>
			<summary
				class="btn btn-outline btn-sm m-1 flex w-full items-center justify-start gap-2 text-xs lg:text-sm"
			>
				<span class="inline-block truncate align-middle font-semibold">
					{getSelectedSortLabel()}
				</span>
				<i class="icon-[mdi--chevron-down] text-xl"></i>
			</summary>
			<ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow">
				{#each SORT_OPTIONS as { label, value } (value)}
					<li>
						<button class="w-full text-left" onclick={() => handleSortChange(value)}>
							{$_(label)}
						</button>
					</li>
				{/each}
			</ul>
		</details>
	</div>
</div>

{#if result.facets && Object.keys(result.facets).length > 0}
	<div class="my-4">
		<FacetBar
			facets={result.facets}
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

{#if result.charts && Object.keys(result.charts).length > 0}
	<div class="my-8">
		<div class="mb-4 flex flex-wrap justify-end gap-2 max-sm:justify-center">
			<a
				href="https://world.openfoodfacts.org/cgi/search.pl?action=display&sort_by=unique_scans_n&page_size=20&graph=1&search_terms={mainSearchTerm}"
				target="_blank"
				class="btn btn-soft btn-sm gap-2 max-sm:w-full"
			>
				{$_('search.generate_graphs_classic', { values: { term: mainSearchTerm } })}
				<span class="icon-[mdi--open-in-new] text-lg"></span>
			</a>
			<a
				href="https://world.openfoodfacts.org/cgi/search.pl?action=display&sort_by=unique_scans_n&page_size=20&search_terms={mainSearchTerm}"
				target="_blank"
				class="btn btn-soft btn-sm gap-2 max-sm:w-full"
			>
				{$_('search.advanced_search_classic', { values: { term: mainSearchTerm } })}
				<span class="icon-[mdi--open-in-new] text-lg"></span>
			</a>

			<button
				class="btn btn-primary btn-sm gap-2 max-sm:w-full"
				onclick={() => (showGraphs = !showGraphs)}
			>
				<span class="icon-[mdi--chart-bar] text-lg"></span>
				{showGraphs ? $_('search.hide_graphs') : $_('search.show_graphs')}
			</button>
		</div>

		<!-- Preferences Collapsible Section -->
		<div class="mb-4 w-full">
			<div class="collapse-arrow border-base-300 bg-base-200 collapse border">
				<input type="checkbox" bind:checked={showPreferences} />
				<div class="collapse-title text-md flex items-center gap-2 font-medium">
					<span class="icon-[mdi--cog] text-lg"></span>
					{$_('preferences.edit_preferences')}
				</div>
				<div class="collapse-content">
					<!-- FIXME: Remove cast when SDK fixes ids type being string | undefined -->
					<PreferencesForm
						onClose={() => (showPreferences = false)}
						groups={data.attributeGroups as AttributeGroup[]}
					/>
				</div>
			</div>
		</div>

		{#if showGraphs}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2" transition:slide={{ duration: 300 }}>
				{#each Object.entries(result.charts) as [chartKey, chartSpec] (chartKey)}
					<div class="bg-base-100 rounded-lg p-4 shadow-md">
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

{#if navigating.to != null}
	<div
		class="bg-base-100/70 absolute inset-0 z-1000 flex cursor-not-allowed items-center justify-center"
	>
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{/if}

{#if result.count > 0}
	<!-- Facet component with binding to access its methods -->

	<div class="max-md:me-4">
		<div class="mt-4 grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each sortedProducts as scoredProduct (scoredProduct.product.code)}
				{#if scoredProduct.product.code != null}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="indicator block w-full">
						{#if showPrices}
							<span class="indicator-item badge badge-secondary badge-sm right-4 z-20">
								{$_('search.prices_badge', {
									values: { count: data.prices[scoredProduct.product.code] }
								})}
							</span>
						{/if}
						<product-card
							class="h-[11rem] w-full"
							product={scoredProduct.product}
							navigating={{
								to:
									navigatingTo === scoredProduct.product.code
										? { params: { barcode: scoredProduct.product.code } }
										: null
							}}
							placeholderImage="/Placeholder.svg"
							onclick={() => navigateToProduct(scoredProduct.product.code)}
							showMatchTag={$personalizedSearch.classifyProductsEnabled}
							personalScore={$personalizedSearch.classifyProductsEnabled
								? scoredProduct.scoreData
								: undefined}
						></product-card>
					</div>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Pagination -->
	<div class="mt-8">
		<Pagination
			page={result.page}
			totalPages={result.page_count}
			pageUrl={(p: number) => {
				const newUrl = new URL(page.url);
				newUrl.searchParams.set('page', p.toString());
				return newUrl.toString();
			}}
		/>
	</div>
{:else}
	<div
		class="flex w-full grid-cols-1 flex-col items-center gap-4 py-50 md:h-auto md:pt-20 md:pb-30 lg:gap-2"
	>
		<p class="mb-4 text-3xl font-bold">{$_('search.product_not_found')}</p>
		<p>{$_('search.product_not_found_desc')}</p>
	</div>
{/if}

<!-- Sticky SORT & FILTER Footer -->
<SearchOptionsFooter
	onSortOptionSelect={(value) => handleSortChange(value)}
	sortBy={selectedSort.value}
/>
