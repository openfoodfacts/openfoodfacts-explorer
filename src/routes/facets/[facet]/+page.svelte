<script lang="ts">
	import { resolve } from '#lib/paths.js';
	import { goto } from '#lib/navigation.js';

	import { page } from '$app/state';
	import KnowledgePanels from '#lib/knowledgepanels/Panels.svelte';
	import Pagination from '#lib/Pagination.svelte';
	import { _ } from '#lib/i18n/index.js';
	import BackLink from '#lib/ui/facets/BackLink.svelte';

	import type { PageProps } from './$types';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import Metadata from '#lib/Metadata.svelte';

	import CountriesMap from './CountriesMap.svelte';

	let { data }: PageProps = $props();

	function formatNumber(n: number) {
		return new Intl.NumberFormat().format(n);
	}

	let { facet, results, pages, page: currentPage, knowledgePanels } = $derived(data);
	let facetName = $derived($_(`facets.names.${facet.replaceAll('-', '_')}`, { default: facet }));
</script>

<Metadata
	title={$_('facets.facet_website_title', {
		default: 'Exploring {facet} - Open Food Facts Explorer',
		values: { facet: facetName }
	})}
	description={$_('facets.facet_website_description', {
		default: 'Discover {facet} on Open Food Facts Explorer.',
		values: { facet: facetName }
	})}
/>

<div class="mb-4">
	<BackLink
		href={resolve('facets')}
		label={$_('navigation.back_to_explore_by', { default: 'Back to explore by' })}
	/>
</div>

<h2 class="my-8 text-3xl font-bold">
	{$_('facets.exploring', { default: 'Exploring {facet}', values: { facet: facetName } })}
</h2>

{#if facet === 'countries'}
	<CountriesMap facet={data.results} />
{/if}

<div class="my-8 flex gap-4 max-md:flex-col">
	{#if Object.entries(knowledgePanels).length > 0}
		<div class="grow">
			<h2 class="my-3 grow text-2xl font-bold">
				{$_('facets.knowledge_panels', { default: 'Knowledge panels' })}
			</h2>
			<KnowledgePanels panels={knowledgePanels} summary={false} />
		</div>
	{/if}

	<div class="grow">
		<h2 class="my-3 grow text-2xl font-bold">
			{$_('facets.search_options', { default: 'Search options' })}
		</h2>
		<label class="select w-full">
			<span class="label">{$_('facets.page_size', { default: 'Page size' })}</span>
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
	</div>
</div>

<div>
	<h2 class="text-2xl font-bold">{$_('facets.products', { default: 'Products' })}</h2>

	<table class="table my-4 table-zebra">
		<thead>
			<tr>
				<th>{$_('facets.name', { default: 'Name' })}</th>
				<th>{$_('facets.known', { default: 'Known' })}</th>
				<th class="text-end">{$_('facets.products', { default: 'Products' })}</th>
			</tr>
		</thead>
		<tbody>
			{#each results.tags as { known, name, products, id } (id)}
				<tr>
					<td>
						<a href={resolve('/facets/[facet]/[value]', { facet, value: id })} class="link">
							{name}
						</a>
					</td>
					<td
						>{known === 1
							? $_('facets.yes', { default: 'Yes' })
							: $_('facets.no', { default: 'No' })}</td
					>
					<td class="text-end">{formatNumber(products)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<Pagination
		page={currentPage ?? 1}
		totalPages={pages}
		pageUrl={(n) => {
			const params = new SvelteURLSearchParams(page.url.search);
			params.set('page', n.toString());
			return `${resolve('/facets/[facet]', { facet })}?${params}`;
		}}
	/>
</div>
