<script lang="ts">
	import { preferences } from '$lib/settings';
	import { getOrDefault } from '$lib/taxo';
	import type { PageData } from './$types';

	export let data: PageData;
	$: category = data.taxonomyElement;
	$: taxonomy = data.taxonomy;
</script>

<h1 class="text-4xl font-bold mt-8">
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

	<ul class="list-disc ml-4">
		{#each category.parents as parent}
			<li>
				<a class="link" href={`/taxo/${taxonomy}/${parent}`}>
					{getOrDefault(data.fullTaxonomy[parent].name, $preferences.lang) ?? parent}
				</a>
			</li>
		{/each}
	</ul>
{/if}

{#if category.children != null}
	<h3 class="text-xl font-bold">Children</h3>
	<ul class="list-disc ml-4">
		{#each category.children as child}
			<li>
				<a class="link" href={`/taxo/${taxonomy}/${child}`}>
					{getOrDefault(data.fullTaxonomy[child].name, $preferences.lang) ?? child}
				</a>
			</li>
		{/each}
	</ul>
{/if}

{#if category.synonyms != null}
	{@const synonyms = getOrDefault(category.synonyms, $preferences.lang) ?? []}
	<h3 class="text-xl font-bold">Synonyms</h3>
	<ul class="list-disc ml-4">
		{#each synonyms as synonym}
			<li>
				{synonym}
			</li>
		{/each}
	</ul>
{/if}

<h3 class="text-xl font-bold">Example of products</h3>
{#await data.streamed.search}
	<progress class="progress" aria-busy="true" />
	<div>Loading example products...</div>
{:then search}
	{#if search.products.length > 0}
		<div class="grid grid-cols-4 gap-4">
			{#each search.products as product}
				<div class="flex flex-row items-center">
					{#if product.image_front_small_url}
						<img src={product.image_front_small_url} class="w-16 h-16 mr-4" alt="Product front" />
					{/if}
					<a href={`/products/${product.code}`} class="link">
						{product.product_name ?? product.code}
					</a>
				</div>
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
