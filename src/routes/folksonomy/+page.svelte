<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let sortedTags = $derived([...data.keys].sort((a, b) => a.k.localeCompare(b.k)));
</script>

<h2 class="text-2xl font-bold">Folksonomy keys</h2>
<ul class="menu flex flex-wrap gap-1 overflow-x-auto p-2 md:gap-2">
	{#each sortedTags as key (key.k)}
		<li>
			<a href="/folksonomy/{key.k}" class="block p-2 font-mono text-sm md:text-base">
				{key.k}
			</a>
		</li>
	{/each}
</ul>
