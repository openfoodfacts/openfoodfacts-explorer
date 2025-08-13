<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Pagination from '$lib/Pagination.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { facet, value, results } = $derived(data);
</script>

<h2 class="my-8 text-3xl font-bold">Exploring {facet}: {value}</h2>

<table class="table">
	<thead>
		<tr>
			<th>Code</th>
			<th>Name</th>
		</tr>
	</thead>
	<tbody>
		{#each results.products as { product_name, code } (code)}
			<tr class="hover:bg-base-200 cursor-pointer" onclick={() => goto(`/products/${code}`)}>
				<td>
					<a href={`/products/${code}`} class="link">
						{code}
					</a>
				</td>
				<td>
					<a href={`/products/${code}`}>
						{product_name}
					</a>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<Pagination
	page={results.page}
	totalPages={Math.ceil(results.count / results.page_size)}
	pageUrl={(n) => {
		const url = page.url;
		url.searchParams.set('page', n.toString());
		return url.toString();
	}}
/>
