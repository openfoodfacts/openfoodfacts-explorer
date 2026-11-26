<script lang="ts">
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	import { _ } from '#lib/i18n/index.js';
	import Metadata from '#lib/Metadata.svelte';
	import Pagination from '#lib/Pagination.svelte';
	import BackLink from '#lib/ui/facets/BackLink.svelte';
	import { facetPairsHref, searchWithoutPage } from '#lib/ui/facets/facet-links.js';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { drilldown, results, pages, page: currentPage } = $derived(data);

	const listFacetName = $derived(
		$_(`facets.names.${drilldown.listFacet}`, { default: drilldown.listFacet })
	);

	// "Brands: ferrero › Labels: en:organic"
	const filtersLabel = $derived(
		drilldown.pairs
			.map((pair) => {
				const facetLabel = $_(`facets.names.${pair.facet}`, { default: pair.facet });
				return `${facetLabel}: ${pair.value}`;
			})
			.join(' › ')
	);

	function formatNumber(n: number) {
		return new Intl.NumberFormat().format(n);
	}

	/** Link to the products that also have this value of the listed facet, keeping the search options. */
	function valueHref(value: string) {
		const pairs = [...drilldown.pairs, { facet: drilldown.listFacet, value }];
		const query = searchWithoutPage(page.url.search);
		return facetPairsHref(pairs, page.url.pathname, { query });
	}

	function pageHref(n: number) {
		const params = new SvelteURLSearchParams(page.url.search);
		params.set('page', n.toString());
		return facetPairsHref(drilldown.pairs, page.url.pathname, {
			listFacet: drilldown.listFacet,
			query: `?${params}`
		});
	}
</script>

<Metadata
	title={$_('facets.drilldown_website_title', {
		values: { facet: listFacetName, filters: filtersLabel },
		default: 'Exploring {facet} for {filters}'
	})}
	description={$_('facets.drilldown_website_description', {
		values: { facet: listFacetName, filters: filtersLabel },
		default: '{facet} of the products matching {filters} on Open Food Facts Explorer'
	})}
/>

<h2 class="my-8 flex items-center gap-2 text-3xl font-bold">
	<BackLink
		href={facetPairsHref(drilldown.pairs, page.url.pathname)}
		label={$_('facets.drilldown_back', {
			values: { filters: filtersLabel },
			default: 'Back to {filters}'
		})}
	/>
	<span
		>{$_('facets.drilldown_heading', {
			values: { facet: listFacetName, filters: filtersLabel },
			default: 'Exploring {facet} for {filters}'
		})}</span
	>
</h2>

<table class="table my-4 table-zebra">
	<thead>
		<tr>
			<th>{$_('facets.name', { default: 'Name' })}</th>
			<th class="text-end">{$_('facets.products', { default: 'Products' })}</th>
		</tr>
	</thead>
	<tbody>
		{#each results.tags as { name, products, id } (id)}
			<tr>
				<td>
					<a href={valueHref(id)} class="link">{name}</a>
				</td>
				<td class="text-end">{formatNumber(products)}</td>
			</tr>
		{:else}
			<tr>
				<td colspan="2">
					{$_('facets.drilldown_empty', { default: 'No values found for these products.' })}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<Pagination page={currentPage} totalPages={pages} pageUrl={pageHref} />
