<script lang="ts">
	import type { KnowledgePanel } from '$lib/api';
	import Panel from './Panel.svelte';

	let { knowledgePanels }: { knowledgePanels: Record<string, KnowledgePanel> } = $props();

	function sort(arr: [string, KnowledgePanel][]) {
		return arr.sort((a, b) => {
			const aTitle = a[0];
			const bTitle = b[0];
			return aTitle.localeCompare(bTitle);
		});
	}

	let panelsArray = $derived(sort(Object.entries(knowledgePanels)));

	const SUMMARY_ID = 'knowledge-panels';
</script>

<div class="">
	<div class="absolute ms-5 max-w-max rounded-xl bg-secondary px-4 text-secondary-content">
		Summary
	</div>

	<div class="mt-3 border-b-2 border-dashed border-secondary"></div>

	<div class="my-4 flex flex-col justify-center gap-4 md:flex-row" id={SUMMARY_ID}>
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
		<Panel {panel} allPanels={knowledgePanels} {id} link={'#' + SUMMARY_ID} />
	{/if}
{/each}
