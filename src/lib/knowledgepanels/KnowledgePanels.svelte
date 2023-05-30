<script lang="ts">
	import type { KnowledgePanel } from '$lib/product';
	import Panel from './KnowledgePanel.svelte';

	export let knowledgePanels: Record<string, KnowledgePanel>;
	$: arr = Object.values(knowledgePanels);
</script>

{#each arr as panel}
	{#if panel.type === 'card'}
		<Panel {panel} allPanels={knowledgePanels} />
	{/if}
{/each}
