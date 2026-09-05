<script lang="ts">
	import { trackOffEvent } from '$lib/analytics';
	import type { KnowledgeElement, KnowledgePanels } from '$lib/api';

	import Debug from '$lib/ui/Debug.svelte';
	import ImageButton from '$lib/ui/ImageButton.svelte';

	import Panel from './Panel.svelte';
	import Map from './Map.svelte';
	import TextPanel from './TextElement.svelte';
	import PanelGroup from './PanelGroup.svelte';
	import Action from './Action.svelte';
	import Table from './Table.svelte';

	type Props = {
		panels: KnowledgePanels;
		element: KnowledgeElement;
		productCode?: string;
		expandedPanels?: Record<string, boolean>;
		onPanelExpansionChange?: (id: string, expanded: boolean) => void;
	};
	let { panels, element, productCode, expandedPanels, onPanelExpansionChange }: Props = $props();
</script>

{#snippet panel(id: string)}
	{@const panel = panels[id]}
	{#if panel !== null}
		<Panel {panel} {panels} {id} {productCode} {expandedPanels} {onPanelExpansionChange} />
	{:else}
		{trackOffEvent('system', 'knowledge_panel_missing', id)}
		<div class="alert alert-warning">Panel not found: {id}</div>
	{/if}
{/snippet}

<div class="mt-4">
	{#if element.element_type === 'panel'}
		{@render panel(element.panel_element.panel_id)}
	{:else if element.element_type === 'panel_group'}
		<PanelGroup {element} {panels} code={productCode} {expandedPanels} {onPanelExpansionChange} />
	{:else if element.element_type === 'action'}
		<Action {element} code={productCode} />
	{:else if element.element_type === 'text'}
		<TextPanel {element} />
	{:else if element.element_type === 'image'}
		<ImageButton
			src={element.image_element.url}
			alt={element.image_element.alt_text}
			{productCode}
		/>
	{:else if element.element_type === 'table'}
		<Table {element} />
	{:else if element.element_type === 'map'}
		<Map {element} />
	{:else}
		<div class="alert alert-warning">No renderer for element type!</div>
		{trackOffEvent('system', 'unsupported_knowledge_element', 'unknown')}
		<Debug data={element} />
	{/if}
</div>
