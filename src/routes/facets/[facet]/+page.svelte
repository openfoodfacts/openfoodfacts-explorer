<script lang="ts">
	import { page } from '$app/state';
	import Pagination from '$lib/Pagination.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { facet, results, pages, page: currentPage } = $derived(data);
</script>

<h2 class="my-8 text-3xl font-bold">Exploring {facet}</h2>

<table class="table">
	<thead>
		<tr>
			<th>Name</th>
			<th>Known</th>
			<th>Products</th>
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
				<td>{products}</td>
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
