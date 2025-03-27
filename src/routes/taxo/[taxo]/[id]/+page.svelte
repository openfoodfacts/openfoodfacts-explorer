<script lang="ts">
	import { preferences } from '$lib/settings';
	import { TAXONOMIES_NAMES, getOrDefault } from '$lib/api';
	import type { PageData } from './$types';
	import ProductCard from '$lib/ui/ProductCard.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let category = $derived(data.taxonomyElement);
	let taxonomy = $derived(data.taxonomy);

	$effect(() => {
		console.debug('category', category);
	});
</script>

<h1 class="text-xl sm:text-4xl">
	<span class="font-bold">{TAXONOMIES_NAMES[taxonomy] ?? taxonomy}:</span>
	{getOrDefault(category.name, $preferences.lang) ?? 'Unknown'}
</h1>

{#if category.wikidata != null}
	{@const wikidata = getOrDefault(category.wikidata, $preferences.lang)}

	<p>
		<span class="font-bold">Wikidata: </span>
		<a href={`https://www.wikidata.org/wiki/${wikidata}`} class="link">
			{wikidata}
		</a>
	</p>
{/if}

{#if category.wikidata_category}
	{@const wikidata_category = getOrDefault(category.wikidata_category, $preferences.lang)}

	<p>
		<span class="font-bold">Wikidata category: </span>
		<a href={`https://www.wikidata.org/wiki/${wikidata_category}`} class="link">
			{wikidata_category}
		</a>
	</p>
{/if}

{#if category.parents != null}
	<h3 class="text-xl font-bold">Parents</h3>

	<ul class="ml-4 list-disc">
		{#each category.parents as parentId (parentId)}
			{@const parentNode = data.fullTaxonomy[parentId]}
			<li>
				<a class="link" href={`/taxo/${taxonomy}/${parentId}`}>
					{parentNode == null
						? parentId
						: (getOrDefault(parentNode.name, $preferences.lang) ?? parentId)}
				</a>
			</li>
		{/each}
	</ul>
{/if}

{#if category.children != null}
	<h3 class="text-xl font-bold">Children</h3>
	<ul class="ml-4 list-disc">
		{#each category.children as childId (childId)}
			{@const childNode = data.fullTaxonomy[childId]}
			<li>
				<a class="link" href={`/taxo/${taxonomy}/${childId}`}>
					{childNode == null
						? childId
						: (getOrDefault(childNode.name, $preferences.lang) ?? childId)}
				</a>
			</li>
		{/each}
	</ul>
{/if}

{#if category.synonyms != null}
	{@const synonyms = getOrDefault(category.synonyms, $preferences.lang) ?? []}
	<h3 class="text-xl font-bold">Synonyms</h3>
	<ul class="ml-4 list-disc">
		{#each synonyms as synonym (synonym)}
			<li>
				{synonym}
			</li>
		{/each}
	</ul>
{/if}

<h3 class="text-xl font-bold">Example of products</h3>
{#await data.streamed.search}
	<div>Loading example products...</div>
{:then search}
	{#if search.products.length > 0}
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each search.products as product (product.code)}
				<ProductCard {product} />
			{/each}
		</div>
	{:else}
		<div class="alert alert-warning">No example products found</div>
	{/if}
{/await}

<details>
	<summary class="cursor-pointer">Debug</summary>
	<pre>{JSON.stringify(category, null, 2)}</pre>
</details>
