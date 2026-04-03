<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import KnowledgePanels from '$lib/knowledgepanels/Panels.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { _ } from '$lib/i18n';
	import BackLink from '$lib/ui/facets/BackLink.svelte';

	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import Metadata from '$lib/Metadata.svelte';

	import CountriesMap from './CountriesMap.svelte';

	let { data }: PageProps = $props();

	function formatNumber(n: number) {
		return new Intl.NumberFormat().format(n);
	}

	let { facet, results, pages, page: currentPage, knowledgePanels, apiError } = $derived(data);
</script>

<Metadata
	title={$_('facets.facet_website_title', { values: { facet } })}
	description={$_('facets.facet_website_description', { values: { facet } })}
/>

<div class="mb-4">
	<BackLink href={resolve('/facets')} label={$_('facets.facet_back_to_list')} />
</div>

<h2 class="my-8 text-3xl font-bold">Exploring {facet}</h2>

{#if apiError}
	<div class="alert alert-info mb-4">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			class="h-6 w-6 shrink-0 stroke-current"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			></path>
		</svg>
		<span
			>The external API is currently unavailable. This is a {$_('general.known_limitation', { default: 'known limitation in development environments' })}.</span
		>
	</div>
{/if}

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
	</div>
</div>

<div>
	<h2 class="text-2xl font-bold">Products</h2>

	{#if !results.tags || results.tags.length === 0}
		<div class="alert alert-warning my-4">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="h-6 w-6 shrink-0 stroke-current"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4v2m0 0a9 9 0 11-18 0 9 9 0 0118 0z"
				></path>
			</svg>
			<span>No data available for this facet.</span>
		</div>
	{:else}
		<table class="table-zebra my-4 table">
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
