<script lang="ts">
	import type { KnowledgePanel } from '$lib/api';

	import Panel from './Panel.svelte';

	export let knowledgePanels: Record<string, KnowledgePanel>;
	$: panelsArray = sort(Object.entries(knowledgePanels));

	function sort(arr: [string, KnowledgePanel][]) {
		return arr.sort((a, b) => {
			const aTitle = a[0];
			const bTitle = b[0];
			return aTitle.localeCompare(bTitle);
		});
	}

	const summaryId = 'knowledge-panels';
</script>

<div class="">
	<div class="absolute ms-5 max-w-max rounded-xl bg-secondary px-4 text-secondary-content">
		Summary
	</div>

	<div class="mt-3 border-b-2 border-dashed border-secondary"></div>

	<div class="my-4 flex flex-col md:flex-row justify-center gap-4" id={summaryId}>
		{#each panelsArray as [panelKey, panel]}
			{#if panel.type === 'card'}
				<a class="btn btn-secondary text-lg" href={'#' + panelKey}>
					{panel.title_element.title}
				</a>
			{/if}
		{/each}
	</div>

	<div class="border-b-2 border-dashed border-secondary"></div>
</div>

{#each panelsArray as [id, panel]}
	{#if panel.type === 'card'}
		<Panel {panel} allPanels={knowledgePanels} {id} link={'#' + summaryId} />
	{/if}
{/each}
