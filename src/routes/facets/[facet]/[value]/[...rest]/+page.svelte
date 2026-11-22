<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { resolve } from '#lib/paths.js';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { goto } from '#lib/navigation.js';
	import { page } from '$app/state';
	import { browser } from '$app/env';

	import { _, getLocale } from '#lib/i18n/index.js';
	import { personalizedSearch } from '#lib/stores/preferencesStore.js';

	import KnowledgePanels from '#lib/knowledgepanels/Panels.svelte';
	import Pagination from '#lib/Pagination.svelte';
	import Metadata from '#lib/Metadata.svelte';
	import ProductGrid from '#lib/ui/ProductGrid.svelte';
	import PersonalizedSearchToggle from '#lib/ui/PersonalizedSearchToggle.svelte';
	import BackLink from '#lib/ui/facets/BackLink.svelte';
	import { facetPairsHref } from '#lib/ui/facets/facet-links.js';

	import type { PageProps } from './$types';
	import {
		getChildCounts,
		getHierarchy,
		sortByCount,
		type HierarchyItem
	} from '#lib/api/taxonomy/hierarchy.js';

	let { data }: PageProps = $props();
	let {
		facet,
		results,
		knowledgePanels,
		searchOptions,
		productAttributes,
		distributionData,
		mapFacet,
		facetPairs
	} = $derived(data);

	const isNested = $derived(facetPairs.length > 1);

	// "Brands: Ferrero › Categories: en:spreads". The first value uses its display name.
	const filtersLabel = $derived(
		facetPairs
			.map((pair, index) => {
				const facetLabel = $_(`facets.names.${pair.facet}`, { default: pair.facet });
				const valueLabel = index === 0 ? facet.value : pair.value;
				return `${facetLabel}: ${valueLabel}`;
			})
			.join(' › ')
	);

	/** Link to this page without one of its filters, back on the first page. */
	function removeFilterHref(index: number) {
		const otherPairs = facetPairs.filter((_, pairIndex) => pairIndex !== index);
		const params = new SvelteURLSearchParams(page.url.search);
		params.delete('page');
		const query = params.size > 0 ? `?${params}` : '';
		return facetPairsHref(otherPairs, page.url.pathname, { query });
	}

	// untrack: refetch only on facet/value change, not on page or sort.
	const facetName = $derived(data.facet.name);
	// The tag id, not data.facet.value, which is the display name on map facets.
	const facetValue = $derived(page.params.value ?? '');
	const noHierarchy = { parents: [] as HierarchyItem[], children: [] as HierarchyItem[] };
	// Parent and child links lead to single facet pages, so nested pages leave them out.
	const hierarchy = $derived.by(() => {
		const [name, value] = [facetName, facetValue];
		return browser && !isNested
			? untrack(() => getHierarchy(fetch, name, value, getLocale()).catch(() => noHierarchy))
			: Promise.resolve(noHierarchy);
	});
	const childCounts = $derived.by(() => {
		const [name, value] = [facetName, facetValue];
		return browser && !isNested
			? untrack(() => getChildCounts(fetch, name, value, getLocale()))
			: Promise.resolve(new Map<string, number>());
	});

	let listView = $state(false);

	const CHILDREN_SHOWN = 8;
	let childrenExpandedFor: string | null = $state(null);

	let MapComponent: typeof import('../../CountriesMap.svelte').default | null = $state(null);
	onMount(async () => {
		MapComponent = (await import('../../CountriesMap.svelte')).default;
	});
</script>

{#if isNested}
	<Metadata
		title={$_('facets.nested_website_title', {
			values: { filters: filtersLabel },
			default: 'Exploring {filters} - Open Food Facts Explorer'
		})}
		description={$_('facets.nested_website_description', {
			values: { filters: filtersLabel },
			default: 'Products matching {filters} on Open Food Facts Explorer'
		})}
	/>
{:else}
	<Metadata
		title={$_('facets.facet_value_website_title', {
			values: { facet: facet.name, value: facet.value }
		})}
		description={$_('facets.facet_value_website_description', {
			values: { facet: facet.name, value: facet.value }
		})}
	/>
{/if}

<h2 class="my-8 flex items-center gap-2 text-3xl font-bold">
	<BackLink
		href={resolve('/facets/[facet]', { facet: facet.name })}
		label={$_('facets.facet_back_to_overview', {
			values: { facet: facet.name },
			default: 'Back to {facet} overview'
		})}
	/>
	{#if isNested}
		<span
			>{$_('facets.nested_heading', {
				values: { filters: filtersLabel },
				default: 'Exploring {filters}'
			})}</span
		>
	{:else}
		<span
			>{$_('facets.value_heading', {
				values: {
					facet: $_(`facets.names.${facet.name}`, { default: facet.name }),
					value: facet.value
				},
				default: 'Exploring {facet}: {value}'
			})}</span
		>
	{/if}
</h2>

{#if isNested}
	<div class="-mt-4 mb-8 flex flex-wrap gap-2">
		{#each facetPairs as pair, index (pair.facet)}
			{@const facetLabel = $_(`facets.names.${pair.facet}`, { default: pair.facet })}
			{@const valueLabel = index === 0 ? facet.value : pair.value}
			<a
				class="badge h-auto gap-1 badge-outline py-1 hover:badge-secondary"
				href={removeFilterHref(index)}
				title={$_('facets.remove_filter', {
					values: { filter: `${facetLabel}: ${valueLabel}` },
					default: 'Remove {filter}'
				})}
			>
				{facetLabel}: {valueLabel}
				<span aria-hidden="true">✕</span>
			</a>
		{/each}
	</div>
{/if}

{#snippet chips(items: HierarchyItem[], counts?: Map<string, number>)}
	{#each items as item (item.id)}
		<a
			class="badge h-auto badge-outline py-1 hover:badge-secondary"
			href={resolve('/facets/[facet]/[value]/[...rest]', {
				facet: facet.name,
				value: item.id,
				rest: ''
			})}
		>
			{item.name}
			{#if counts?.has(item.name)}
				<span class="text-[10px] opacity-60"
					>{counts.get(item.name)?.toLocaleString(getLocale())}</span
				>
			{/if}
		</a>
	{/each}
{/snippet}

{#await hierarchy}
	<div class="-mt-4 mb-8 flex items-center gap-2 text-sm opacity-70">
		<span class="loading loading-sm loading-spinner"></span>
		{$_('general.loading', { default: 'Loading…' })}
	</div>
{:then { parents, children }}
	{#if parents.length || children.length}
		{@const expanded = childrenExpandedFor === facetValue}
		<div class="-mt-4 mb-8 flex flex-col gap-3">
			{#if parents.length}
				<div class="flex flex-col gap-2 sm:flex-row">
					<span class="w-24 shrink-0 pt-1 text-sm font-semibold opacity-70">
						{$_('facets.hierarchy_belongs_to', { default: 'Belongs to' })}
					</span>
					<div class="flex flex-wrap gap-2">{@render chips(parents)}</div>
				</div>
			{/if}
			{#if children.length}
				<div class="flex flex-col gap-2 sm:flex-row">
					<span class="w-24 shrink-0 pt-1 text-sm font-semibold opacity-70">
						{$_('facets.hierarchy_includes', { default: 'Includes' })}
					</span>
					<div class="flex flex-wrap items-center gap-2">
						{#await childCounts}
							{@render chips(expanded ? children : children.slice(0, CHILDREN_SHOWN))}
						{:then counts}
							{@const sorted = sortByCount(children, counts)}
							{@render chips(expanded ? sorted : sorted.slice(0, CHILDREN_SHOWN), counts)}
						{/await}
						{#if !expanded && children.length > CHILDREN_SHOWN}
							<button
								type="button"
								class="btn btn-ghost btn-xs"
								onclick={() => (childrenExpandedFor = facetValue)}
							>
								{$_('facets.hierarchy_more', {
									values: { count: children.length - CHILDREN_SHOWN },
									default: '+ {count} more'
								})}
							</button>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/if}
{/await}

{#if distributionData && MapComponent && mapFacet}
	<div class="my-8 w-full">
		<h2 class="mb-4 text-2xl font-bold">
			{$_(mapFacet.heading, {
				default: mapFacet.defaultHeading
			})}
		</h2>
		<MapComponent facet={distributionData} />
		{#if data.mapIsPageLimited}
			<p class="mt-2 text-sm text-base-content/70">
				{$_('facets.map_page_limited', {
					default: 'This map only includes data from the current page.'
				})}
			</p>
		{/if}
	</div>
{/if}

<div class="my-8 flex w-full flex-col gap-4">
	{#if Object.entries(knowledgePanels).length > 0}
		<div class="w-full">
			<h2 class="mb-2 grow text-2xl font-bold">Knowledge Panels</h2>
			<KnowledgePanels panels={knowledgePanels} summary={false} />
		</div>
	{/if}

	<div class="w-full space-y-2">
		<h2 class="mb-2 grow text-2xl font-bold">Search Options</h2>
		<div class="grid gap-4 md:grid-cols-3">
			<label class="select w-full">
				<span class="label w-50">{$_('search.page_size')}</span>
				<select
					value={`${results.page_size}`}
					oninput={(e) => {
						const params = new SvelteURLSearchParams(page.url.search);
						params.set('page_size', e.currentTarget.value);
						goto(`?${params}`);
					}}
				>
					<option value="10">10</option>
					<option value="50">50</option>
					<option value="100">100</option>
					<option value="200">200</option>
				</select>
			</label>

			<label class="select w-full">
				<span class="label w-50">{$_('search.sort_by_label')}</span>
				<select
					value={searchOptions.sortBy || 'last_modified_t'}
					oninput={(e) => {
						const params = new SvelteURLSearchParams(page.url.search);
						params.set('sort_by', e.currentTarget.value);
						goto(`?${params}`);
					}}
				>
					<option value="popularity">Popularity</option>
					<option value="nutriscore_score">{$_('nutriscore')}</option>
					<option value="environmental_score_score">{$_('ecoscore')}</option>
					<option value="created_t">{$_('search.creation_date')}</option>
					<option value="last_modified_t">{$_('search.last_modified_date')}</option>
				</select>
			</label>

			<label class="select w-full">
				<span class="label w-50">{$_('search.advanced_view')}</span>
				<select
					value={`${listView}`}
					oninput={(e) => {
						listView = e.currentTarget.value === 'true';
					}}
				>
					<option value="false">Off</option>
					<option value="true">On</option>
				</select>
			</label>
		</div>
	</div>
</div>

<div class="my-8">
	<h2 class="text-2xl font-bold">Products</h2>
	<div class="my-8">
		{#if !listView}
			<!-- Preferences Collapsible Section -->
			<div class="mb-4">
				<PersonalizedSearchToggle></PersonalizedSearchToggle>
			</div>
			<ProductGrid
				products={results.products}
				attributes={productAttributes}
				sortByScore={$personalizedSearch.classifyProductsEnabled}
			/>
		{:else}
			<table class="table my-4">
				<thead>
					<tr>
						<th>Code</th>
						<th>Name</th>
					</tr>
				</thead>
				<tbody>
					{#each results.products as { product_name, code } (code)}
						<tr class="cursor-pointer hover:bg-base-200" onclick={() => goto(`/products/${code}`)}>
							<td>
								<a href={resolve('/products/[barcode]', { barcode: code })} class="link">
									{code}
								</a>
							</td>
							<td>
								<a href={resolve('/products/[barcode]', { barcode: code })}>
									{product_name}
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
	<Pagination
		page={results.page}
		totalPages={results.page_size > 0 ? Math.ceil(results.count / results.page_size) : 0}
		pageUrl={(n) => {
			const params = new SvelteURLSearchParams(page.url.search);
			params.set('page', n.toString());
			return facetPairsHref(facetPairs, page.url.pathname, { query: `?${params}` });
		}}
	/>
</div>
