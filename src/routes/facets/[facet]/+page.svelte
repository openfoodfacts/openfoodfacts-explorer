<script lang="ts">
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
	import IconMdiAlert from '@iconify-svelte/mdi/alert';

	import CountriesMap from './CountriesMap.svelte';

	let { data }: PageProps = $props();

	function formatNumber(n: number) {
		return new Intl.NumberFormat().format(n);
	}

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
</script>

<Metadata
	title={$_('facets.facet_website_title', { values: { facet } })}
	description={$_('facets.facet_website_description', { values: { facet } })}
/>

<div class="mb-4">
	<BackLink
		href={resolve('facets')}
		label={$_('navigation.back_to_explore_by', { default: 'Back to explore by' })}
	/>
</div>

<h2 class="my-8 text-3xl font-bold">Exploring {facet}</h2>

{#if facet === 'countries'}
	<CountriesMap facet={data.results} />
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
		{#if !isFiltered}
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

		{#if $userInfo != null || isFiltered}
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
	{#if isFiltered}
		<p class="mt-2 text-sm opacity-70">
			{$_('facets.filter_results_count', {
				default: '{count, plural, one {# matching value} other {# matching values}}',
				values: { count: results.tags.length }
			})}
		</p>
	{/if}

	<table class="table my-4 table-zebra">
		<thead>
			<tr>
				<th>Name</th>
				<th>Known</th>
				<th class="text-end">Products</th>
			</tr>
		</thead>
		<tbody>
			{#each results.tags as { known, name, products, id } (id)}
				<tr>
					<td>
						<a href={`/facets/${facet}/${id}`} class="link">
							{name}
						</a>
					</td>
					<td>{known === 1 ? 'Yes' : 'No'}</td>
					<td class="text-end">{formatNumber(products)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if !isFiltered}
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
