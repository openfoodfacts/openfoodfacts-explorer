<script lang="ts">
	import { page } from '$app/stores';
	import { preferences } from '$lib/settings';
	import { getOrDefault } from '$lib/taxo';
	import type { PageData } from './$types';

	export let data: PageData;
	$: category = data.taxonomyElement;
	$: taxonomy = data.taxonomy;
</script>

{#if category.parents != null}
	<h3 class="text-xl font-bold">Parents</h3>

	<ul class="list-disc ml-4">
		{#each category.parents as parent}
			<li>
				<a class="link" href={`/taxo/${taxonomy}/${parent}`}>
					{getOrDefault(data.relatedData[parent].name, $preferences.lang) ?? parent}
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
					{getOrDefault(data.relatedData[child].name, $preferences.lang) ?? child}
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

<details>
	<summary class="cursor-pointer">Debug</summary>
	<pre>
{JSON.stringify(category, null, 2)}
</pre>
</details>
