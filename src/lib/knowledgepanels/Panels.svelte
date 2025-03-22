<script lang="ts">
	import type { KnowledgePanel } from '$lib/api';
	import Panel from './Panel.svelte';

	let {
		knowledgePanels,
		productCode
	}: {
		knowledgePanels: Record<string, KnowledgePanel>;
		productCode?: string;
	} = $props();

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
	<div class="bg-secondary text-secondary-content absolute ms-5 max-w-max rounded-xl px-4">
		Summary
	</div>

	<div class="border-secondary mt-3 border-b-2 border-dashed"></div>

	<div class="my-4 flex flex-row flex-wrap justify-center gap-2 md:gap-4" id={SUMMARY_ID}>
		{#each panelsArray as [panelKey, panel] (panelKey)}
			{#if panel.type === 'card'}
				<a class="btn btn-secondary text-lg" href={'#' + panelKey}>
					{panel.title_element.title}
				</a>
			{/if}
		{/each}
	</div>

	<div class="border-secondary border-b-2 border-dashed"></div>
</div>

{#each panelsArray as [id, panel] (id)}
	{#if panel.type === 'card'}
		<Panel {panel} allPanels={knowledgePanels} {id} link={'#' + SUMMARY_ID} {productCode} />
	{/if}
{/each}
