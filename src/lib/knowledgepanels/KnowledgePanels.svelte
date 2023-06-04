<script lang="ts">
	import type { KnowledgePanel } from '$lib/api';

	import Panel from './KnowledgePanel.svelte';

	export let knowledgePanels: Record<string, KnowledgePanel>;
	$: arr = Object.entries(knowledgePanels);
</script>

<div class="btn-group justify-center">
	{#each arr as [panelKey, panel]}
		{#if panel.type === 'card'}
			<a href={'#' + panelKey} class="btn">
				{panel.title_element.title}
			</a>
		{/if}
	{/each}
</div>

{#each arr as [id, panel]}
	{#if panel.type === 'card'}
		<Panel {panel} allPanels={knowledgePanels} {id} />
	{/if}
{/each}
