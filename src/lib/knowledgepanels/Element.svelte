<script lang="ts">
	import { tracker } from '@sinnwerkstatt/sveltekit-matomo';
	import type { KnowledgeElement, KnowledgePanel } from '$lib/api';

	import Debug from '$lib/ui/Debug.svelte';
	import InteractiveProductImage from '$lib/ui/InteractiveProductImage.svelte';

	import Panel from './Panel.svelte';
	import Map from './Map.svelte';
	import TextPanel from './TextElement.svelte';
	import PanelGroup from './PanelGroup.svelte';
	import Action from './Action.svelte';
	import Table from './Table.svelte';

	type Props = {
		panels: Record<string, KnowledgePanel>;
		element: KnowledgeElement;
		productCode?: string;
	};
	let { panels, element, productCode }: Props = $props();
</script>

{#snippet panel(id: string)}
	{@const panel = panels[id]}
	{#if panel !== null}
		<Panel {panel} {panels} {id} {productCode} />
	{:else}
		{$tracker?.trackEvent('Panel Not Found', 'Panel ID', id)}
		<div class="alert alert-warning">Panel not found: {id}</div>
	{/if}
{/snippet}

<div class="my-1">
	{#if element.element_type === 'panel'}
		{@render panel(element.panel_element.panel_id)}
	{:else if element.element_type === 'panel_group'}
		<PanelGroup {element} {panels} code={productCode} />
	{:else if element.element_type === 'action'}
		<Action {element} code={productCode} />
	{:else if element.element_type === 'text'}
		<TextPanel {element} />
	{:else if element.element_type === 'image'}
		<InteractiveProductImage
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
		{$tracker?.trackEvent('Element Not Found', 'Element', JSON.stringify(element))}
		<Debug data={element} />
	{/if}
</div>
