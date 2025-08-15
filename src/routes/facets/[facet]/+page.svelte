<script lang="ts">
	import { page } from '$app/state';
	import Panels from '$lib/knowledgepanels/Panels.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import type { PageProps } from './$types';

	function formatNumber(n: number) {
		return new Intl.NumberFormat().format(n);
	}

	let { data }: PageProps = $props();
	let { facet, results, pages, page: currentPage, knowledgePanels } = $derived(data);
</script>

<h2 class="my-8 text-3xl font-bold">Exploring {facet}</h2>

<div class="my-8">
	<Panels {knowledgePanels} summary={false} />
</div>

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
	page={currentPage}
	totalPages={pages}
	pageUrl={(n) => {
		const url = page.url;
		url.searchParams.set('page', n.toString());
		return url.toString();
	}}
/>
