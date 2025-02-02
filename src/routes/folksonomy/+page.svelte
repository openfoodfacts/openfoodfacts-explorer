<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let sortedTags = $derived([...data.keys].sort((a, b) => a.k.localeCompare(b.k)));
</script>

<h2 class="text-2xl font-bold">Folksonomy keys</h2>
<ul class="menu gap-1">
	{#each sortedTags as key}
		<li>
			<a href="/folksonomy/{key.k}" class="font-mono">
				{key.k}
			</a>
		</li>
	{/each}
</ul>
