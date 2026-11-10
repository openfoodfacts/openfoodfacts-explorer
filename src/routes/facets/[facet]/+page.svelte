<script lang="ts">
	import { MAP_FACETS } from './map-facets';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import KnowledgePanels from '#lib/knowledgepanels/Panels.svelte';
	import Pagination from '#lib/Pagination.svelte';
	import { _ } from '#lib/i18n/index.js';
	import BackLink from '#lib/ui/facets/BackLink.svelte';

	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import Metadata from '#lib/Metadata.svelte';
	import { userInfo } from '#lib/stores/user.js';
	import { FACET_FILTER_MAX_RESULTS, filterFacet } from '#lib/api/facets.js';
	import IconMdiAlert from '@iconify-svelte/mdi/alert';

	import CountriesMap from './CountriesMap.svelte';

	let { data }: PageProps = $props();

	function formatNumber(n: number) {
		return new Intl.NumberFormat().format(n);
	}

	const formatKnown = (known: number) => (known === -1 ? '—' : known === 1 ? 'Yes' : 'No');

	let {
		facet,
		results,
		pages,
		page: currentPage,
		knowledgePanels,
		filter,
		status,
		isFiltered
	} = $derived(data);

	type FilterState =
		{ status: 'idle' | 'loading' | 'error' } | { status: 'done'; tags: typeof results.tags };
	let filterState = $state<FilterState>({ status: 'idle' });

	// The whole-facet filter is expensive for the backend: only run it for logged-in users,
	// and only in the browser ($effect never runs during server-side rendering)
	let canFilter = $derived(isFiltered && $userInfo != null);

	$effect(() => {
		if (!canFilter) {
			filterState = { status: 'idle' };
			return;
		}

		const controller = new AbortController();
		filterState = { status: 'loading' };
		filterFacet(fetch, facet, { filter, status, signal: controller.signal })
			.then(({ tags }) => {
				if (!controller.signal.aborted) filterState = { status: 'done', tags };
			})
			.catch((err) => {
				if (controller.signal.aborted) return;
				console.error('Failed to filter facet:', err);
				filterState = { status: 'error' };
			});

		// A new filter, or leaving the page, cancels the running one
		return () => controller.abort();
	});
</script>

<Metadata
	title={$_('facets.facet_website_title', { values: { facet } })}
	description={$_('facets.facet_website_description', { values: { facet } })}
/>

<h2 class="my-8 flex items-center gap-2 text-3xl font-bold">
	<BackLink
		href={resolve('facets')}
		label={$_('navigation.back_to_explore_by', { default: 'Back to explore by' })}
	/>
	<span
		>{$_('facets.heading', {
			values: { facet: $_(`facets.names.${facet}`, { default: facet }) },
			default: 'Exploring {facet}'
		})}</span
	>
</h2>

{#if Object.hasOwn(MAP_FACETS, facet)}
	<CountriesMap facet={data.mapResults} />
	{#if data.mapIsPageLimited}
		<p class="mt-2 text-sm text-base-content/70">
			{$_('facets.map_page_limited', {
				default: 'This map only includes data from the current page.'
			})}
		</p>
	{/if}
{/if}

<div class="my-8 flex gap-4 max-md:flex-col">
	{#if Object.entries(knowledgePanels).length > 0}
		<div class="grow">
			<h2 class="my-3 grow text-2xl font-bold">Knowledge Panels</h2>
			<KnowledgePanels panels={knowledgePanels} summary={false} />
		</div>
	{/if}

	<div class="grow">
		<h2 class="my-3 grow text-2xl font-bold">Search Options</h2>
		{#if !canFilter}
			<label class="select w-full">
				<span class="label">Page Size</span>
				<select
					id="page_size"
					value={`${data.pageSize}`}
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
		{/if}

		{#if $userInfo == null && isFiltered}
			<div class="mt-4 alert alert-info" role="note">
				{$_('facets.filter_login_required', { default: 'Log in to filter the whole facet.' })}
			</div>
		{/if}

		{#if $userInfo != null}
			<form method="GET" class="mt-4 flex flex-col gap-3">
				<div class="flex gap-2 max-sm:flex-col">
					<input
						type="search"
						name="filter"
						value={filter}
						class="input grow"
						placeholder={$_('facets.filter_placeholder', { default: 'Filter values, e.g. apple' })}
						aria-label={$_('facets.filter_label', { default: 'Filter the whole facet' })}
					/>
					<select
						name="status"
						class="select sm:w-auto"
						value={status ?? ''}
						aria-label={$_('facets.filter_status_label', { default: 'Status' })}
					>
						<option value="">{$_('facets.filter_status_all', { default: 'All values' })}</option>
						<option value="known">
							{$_('facets.filter_status_known', { default: 'Known values' })}
						</option>
						<option value="unknown">
							{$_('facets.filter_status_unknown', { default: 'Unknown values' })}
						</option>
					</select>
					<button type="submit" class="btn btn-secondary">
						{$_('facets.filter_submit', { default: 'Filter' })}
					</button>
					{#if isFiltered}
						<a href={page.url.pathname} class="btn btn-outline">
							{$_('facets.filter_clear', { default: 'Clear' })}
						</a>
					{/if}
				</div>
				<div class="alert alert-warning" role="note">
					<IconMdiAlert class="h-5 w-5 shrink-0" aria-hidden="true" />
					<span>
						{$_('facets.filter_warning', {
							default:
								'Filtering scans every value of this facet and can take up to a minute to load. Please use it sparingly.'
						})}
					</span>
				</div>
			</form>
		{/if}
	</div>
</div>

<div>
	<h2 class="text-2xl font-bold">Products</h2>
	{#if canFilter && filterState.status === 'loading'}
		<p class="mt-4 flex items-center gap-2">
			<span class="loading loading-sm loading-spinner" aria-hidden="true"></span>
			{$_('facets.filter_loading', {
				default: 'Filtering… this can take up to a minute.'
			})}
		</p>
	{:else if canFilter && filterState.status === 'error'}
		<div class="mt-4 alert alert-error" role="alert">
			{$_('facets.filter_error', {
				default: 'Filtering failed or took too long. Try a more specific filter.'
			})}
		</div>
	{:else if filterState.status === 'done'}
		<p class="mt-2 text-sm opacity-70">
			{$_('facets.filter_results_count', {
				default: '{count, plural, one {# matching value} other {# matching values}}',
				values: { count: filterState.tags.length }
			})}
			{#if filterState.tags.length >= FACET_FILTER_MAX_RESULTS}
				{$_('facets.filter_truncated', {
					default: 'Showing the first {count} matches. Refine the filter to see the others.',
					values: { count: FACET_FILTER_MAX_RESULTS }
				})}
			{/if}
		</p>
	{/if}

	{#if !canFilter || filterState.status === 'done'}
		{@const tags = filterState.status === 'done' ? filterState.tags : results.tags}
		<table class="table my-4 table-zebra">
			<thead>
				<tr>
					<th>Name</th>
					<th>Known</th>
					<th class="text-end">Products</th>
				</tr>
			</thead>
			<tbody>
				{#each tags as { known, name, products, id } (id)}
					<tr>
						<td>
							<a href={`/facets/${facet}/${id}`} class="link">
								{name}
							</a>
						</td>
						<td>{formatKnown(known)}</td>
						<td class="text-end">{formatNumber(products)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}

	{#if !canFilter}
		<Pagination
			page={currentPage ?? 1}
			totalPages={pages}
			pageUrl={(n) => {
				const params = new SvelteURLSearchParams(page.url.search);
				params.set('page', n.toString());
				return `?${params}`;
			}}
		/>
	{/if}
</div>
