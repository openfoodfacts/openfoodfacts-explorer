<script lang="ts">
	import type {
		KnowledgePanel,
		KnowledgePanelElement as KnowledgePanelElementType
	} from '$lib/api';
	import Panel from './Panel.svelte';

	type Props = {
		allPanels: Record<string, KnowledgePanel>;
		element: KnowledgePanelElementType;
	};
	let { allPanels, element }: Props = $props();

	// Extract the panel ID and get the panel from allPanels
	const id = element.panel_element.panel_id;
	const panel = allPanels[id];
</script>

{#if panel}
	<Panel {panel} {allPanels} {id} />
{:else}
	<div class="alert alert-warning">Panel not found: {id}</div>
{/if}
