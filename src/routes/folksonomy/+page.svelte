<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: sortedTags = [...data.keys].sort((a, b) => a.k.localeCompare(b.k));
</script>

<h2 class="text-2xl font-bold">Folksonomy keys</h2>
<ul class="menu gap-1">
	{#each sortedTags as key}
		<li>
			<a href="/folksonomy/{key.k}">
				{key.k}
			</a>
		</li>
	{/each}
</ul>
