<script lang="ts">
	import type { KnowledgePanel } from '$lib/api';
	import Panel from './Panel.svelte';

	let {
		knowledgePanels,
		productCode,
		summary = true
	}: {
		knowledgePanels: Record<string, KnowledgePanel>;
		productCode?: string;
		summary?: boolean;
	} = $props();

	let panelsArray = $derived(
		Object.entries(knowledgePanels).toSorted((a, b) => {
			const aTitle = a[0];
			const bTitle = b[0];
			return aTitle.localeCompare(bTitle);
		})
	);

	const SUMMARY_ID = 'knowledge-panels';
</script>

{#if summary}
	<div>
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
{/if}

{#each panelsArray as [id, panel] (id)}
	<Panel {panel} allPanels={knowledgePanels} {id} link={'#' + SUMMARY_ID} {productCode} />
{/each}
