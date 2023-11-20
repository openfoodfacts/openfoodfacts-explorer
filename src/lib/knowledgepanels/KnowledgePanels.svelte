<script lang="ts">
	import type { KnowledgePanel } from '$lib/api';

	import Panel from './KnowledgePanel.svelte';

	export let knowledgePanels: Record<string, KnowledgePanel>;
	$: arr = Object.entries(knowledgePanels);

	const summaryId = 'knowledge-panels';
</script>

<div class="">
	<div class="absolute ms-5 max-w-max rounded-xl bg-secondary px-4 text-secondary-content">
		Summary
	</div>

	<div class="mt-3 border-b-2 border-dashed border-secondary"></div>

	<div class="my-4 flex justify-center gap-4" id={summaryId}>
		{#each arr as [panelKey, panel]}
			{#if panel.type === 'card'}
				<a class="btn btn-secondary text-lg" href={'#' + panelKey}>
					{panel.title_element.title}
				</a>
			{/if}
		{/each}
	</div>

	<div class="border-b-2 border-dashed border-secondary"></div>
</div>

{#each arr as [id, panel]}
	{#if panel.type === 'card'}
		<Panel {panel} allPanels={knowledgePanels} {id} link={'#' + summaryId} />
	{/if}
{/each}
