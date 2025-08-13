<script lang="ts">
	import { preferences } from '$lib/settings';
	import { TAXONOMIES_NAMES, getOrDefault } from '$lib/api';
	import type { PageProps } from './$types';
	import TaxonomyDAG from '$lib/ui/TaxonomyDAG.svelte';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();
	let { taxonomyName, taxonomy, taxonomyElement: element, wikidata } = $derived(data);
</script>

<h1 class="mt-16 mb-8 text-xl sm:text-4xl">
	<span class="font-bold">{TAXONOMIES_NAMES[taxonomyName] ?? taxonomyName}:</span>
	{getOrDefault(element.name, $preferences.lang) ?? 'Unknown'}
</h1>

{#if wikidata != null}
	<p class="mt-4">
		<span class="font-bold">Wikidata: </span>
		{#if wikidata.label}
			<span>{wikidata.label}</span>
		{:else}
			<span class="italic">No label</span>
		{/if}
		<a href={`https://www.wikidata.org/wiki/${wikidata.id}`} class="link">
			({wikidata.id})
		</a>

		{#if wikidata.description}
			<span>-</span>
			<span>{wikidata.description}</span>
		{/if}
	</p>
{/if}

{#if element.wikidata_category}
	{@const wikidata_category = getOrDefault(element.wikidata_category, $preferences.lang)}

	<p class="mt-4">
		<span class="font-bold">Wikidata category: </span>
		<a href={`https://www.wikidata.org/wiki/${wikidata_category}`} class="link">
			{wikidata_category}
		</a>
	</p>
{/if}

<div class="my-8 flex flex-col gap-2">
	<div class="bg-base-100 border-base-300 collapse-arrow collapse border">
		<input type="radio" name="dag-view" checked />
		<div class="collapse-title text-xl font-medium">
			<h2 class="text-xl font-bold">Relations</h2>
		</div>
		<div class="collapse-content">
			{#if element.parents != null}
				<h3 class="mb-2 text-lg font-bold">Parents</h3>
				<ul class="ml-4 list-disc">
					{#each element.parents as parent (parent)}
						<li>
							<a href={`/taxo/${taxonomyName}/${parent}`} class="link">
								{parent}
							</a>
						</li>
					{/each}
				</ul>
			{/if}

			{#if element.children != null}
				<h3 class="mt-4 mb-2 text-lg font-bold">Children</h3>
				<ul class="ml-4 list-disc">
					{#each element.children as child (child)}
						<li>
							<a href={`/taxo/${taxonomyName}/${child}`} class="link">
								{child}
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>

	<div class="bg-base-100 border-base-300 collapse-arrow collapse border">
		<input type="radio" name="dag-view" />
		<div class="collapse-title text-xl font-medium">
			<h2 class="text-xl font-bold">DAG view</h2>
		</div>
		<div class="collapse-content">
			<TaxonomyDAG
				id={element.name['en'] || element.name['fr'] || element.name['es'] || element.name['it']}
				node={element}
				{taxonomy}
				onclick={(nodeId) => {
					goto(`/taxo/${taxonomyName}/${nodeId}`);
				}}
			/>
		</div>
	</div>
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
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
				{#each search.products as product (product.code)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<product-card
						{product}
						placeholderImage="/Placeholder.svg"
						onclick={() => {
							goto(`/products/${product.code}`);
						}}
					></product-card>
				{/each}
			</div>
		{:else}
			<div class="alert alert-warning">No example products found</div>
		{/if}
	{/await}
</div>
