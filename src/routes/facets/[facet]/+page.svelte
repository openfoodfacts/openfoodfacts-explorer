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
	import TagMiniature from '$lib/ui/TagMiniature.svelte';
	import { getTagMiniatureUrl } from '$lib/ui/tagUtils';

	let { data }: PageProps = $props();

	function formatNumber(n: number) {
		return new Intl.NumberFormat().format(n);
	}

	let { facet, results, pages, page: currentPage, knowledgePanels } = $derived(data);
</script>

<Metadata
	title={$_('facets.facet_website_title', { values: { facet } })}
	description={$_('facets.facet_website_description', { values: { facet } })}
/>

<div class="mb-4">
	<BackLink href={resolve('/facets')} label={$_('facets.facet_back_to_list')} />
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

	<table class="table my-4 table-zebra">
		<thead>
			<tr>
				<th>Name</th>
				<th>Known</th>
				<th class="text-end">Products</th>
			</tr>
		</thead>
		<tbody>
			{#each results.tags as tag (tag.id)}
				<tr>
					<td>
						<div class="flex items-center gap-2">
							{#if getTagMiniatureUrl(tag)}
								<TagMiniature src={getTagMiniatureUrl(tag)} alt={tag.name} size="md" />
							{/if}
							<a href={`/facets/${facet}/${tag.id}`} class="link">
								{tag.name}
							</a>
						</div>
					</td>
					<td>{tag.known === 1 ? 'Yes' : 'No'}</td>
					<td class="text-end">{formatNumber(tag.products)}</td>
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
</div>
