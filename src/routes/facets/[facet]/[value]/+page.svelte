<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import KnowledgePanels from '$lib/knowledgepanels/Panels.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import type { PageProps } from './$types';
	import { _ } from '$lib/i18n';

	let { data }: PageProps = $props();
	let { facet, value, results, knowledgePanels } = $derived(data);
</script>

<div class="mb-4">
	<a href={`/facets/${facet}`} class="btn btn-ghost w-full">
		<span class="icon icon-[mdi--arrow-left]"></span>
		{$_('facets.facet_back_to_overview', { values: { facet } })}
	</a>
</div>

<h2 class="my-8 text-3xl font-bold">Exploring {facet}: {value}</h2>

{#if Object.entries(knowledgePanels).length > 0}
	<div class="my-4">
		<h2 class="my-3 grow text-2xl font-bold">Knowledge Panels</h2>
		<KnowledgePanels {knowledgePanels} summary={false} />
	</div>
{/if}

<div class="my-8">
	<h2 class="text-2xl font-bold">Products</h2>

	<table class="my-4 table">
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
</div>
