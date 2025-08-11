<script lang="ts">
	import { preferences } from '$lib/settings';
	import { TAXONOMIES_NAMES, getOrDefault } from '$lib/api';
	import type { PageData } from './$types';
	import TaxonomyDAG from '$lib/ui/TaxonomyDAG.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { taxonomy, taxonomyElement: element } = $derived(data);
</script>

<h1 class="text-xl sm:text-4xl">
	<span class="font-bold">{TAXONOMIES_NAMES[taxonomy] ?? taxonomy}:</span>
	{getOrDefault(element.name, $preferences.lang) ?? 'Unknown'}
</h1>

{#if element.wikidata != null}
	{@const wikidata = getOrDefault(element.wikidata, $preferences.lang)}

	<p>
		<span class="font-bold">Wikidata: </span>
		<a href={`https://www.wikidata.org/wiki/${wikidata}`} class="link">
			{wikidata}
		</a>
	</p>
{/if}

{#if element.wikidata_category}
	{@const wikidata_category = getOrDefault(element.wikidata_category, $preferences.lang)}

	<p>
		<span class="font-bold">Wikidata category: </span>
		<a href={`https://www.wikidata.org/wiki/${wikidata_category}`} class="link">
			{wikidata_category}
		</a>
	</p>
{/if}

<!-- DAG view for parents and children -->
<div class="mt-8">
	<h3 class="my-4 text-xl font-bold">Taxonomy Graph</h3>
	<TaxonomyDAG
		id={element.name['en'] || element.name['fr'] || element.name['es'] || element.name['it']}
		node={element}
		taxonomy={data.fullTaxonomy}
		onclick={(nodeId) => {
			window.location.href = `/taxo/${taxonomy}/${nodeId}`;
		}}
	/>
</div>

{#if element.synonyms != null}
	{@const synonyms = getOrDefault(element.synonyms, $preferences.lang) ?? []}
	<div class="mt-8">
		<h3 class="my-4 text-xl font-bold">Synonyms</h3>
		<ul class="ml-4 list-disc">
			{#each synonyms as synonym (synonym)}
				<li>
					{synonym}
				</li>
			{/each}
		</ul>
	</div>
{/if}

<div class="mt-8">
	<h3 class="my-4 text-xl font-bold">Example of products</h3>
	{#await data.streamed.search}
		<div>Loading example products...</div>
	{:then search}
		{#if search.products.length > 0}
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
				{#each search.products as product (product.code)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<product-card
						{product}
						placeholderImage="/Placeholder.svg"
						onclick={() => {
							window.location.href = `/products/${product.code}`;
						}}
					></product-card>
				{/each}
			</div>
		{:else}
			<div class="alert alert-warning">No example products found</div>
		{/if}
	{/await}
</div>
