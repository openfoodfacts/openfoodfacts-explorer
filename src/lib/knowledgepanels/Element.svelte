<script lang="ts">
	import type { KnowledgeElement, KnowledgePanel, KnowledgeTableElement } from '$lib/api';
	import Debug from '$lib/ui/Debug.svelte';

	import Panel from './Panel.svelte';
	import Map from './Map.svelte';
	import TextPanel from './TextElement.svelte';
	import PanelGroup from './PanelGroup.svelte';
	import ImageButton from '$lib/ui/ImageButton.svelte';
	import Action from './Action.svelte';
	import { tracker } from '@sinnwerkstatt/sveltekit-matomo';

	type Props = {
		allPanels: Record<string, KnowledgePanel>;
		element: KnowledgeElement;
		productCode?: string;
	};
	let { allPanels, element, productCode }: Props = $props();
</script>

{#snippet table(element: KnowledgeTableElement)}
	<div class="overflow-x-auto">
		<table class="table-compact table w-full">
			<thead>
				<tr>
					{#each element.table_element.columns as column, columnIndex (columnIndex)}
						<th>{column.text}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each element.table_element.rows as row, rowIndex (rowIndex)}
					<tr>
						{#each row.values as cell, cellIndex (cellIndex)}
							<td>{cell.text}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/snippet}

<div class="my-1">
	{#if element.element_type === 'panel_group'}
		<PanelGroup {element} {allPanels} {productCode} />
	{:else if element.element_type === 'action'}
		<Action {element} {allPanels} {productCode} />
	{:else if element.element_type === 'panel'}
		{#if 'panel_element' in element}
			{@const id = element.panel_element.panel_id}
			{@const panel = allPanels[id]}
			{#if panel !== null}
				<Panel {panel} {allPanels} {id} {productCode} />
			{:else}
				{$tracker?.trackEvent('Panel Not Found', 'Panel ID', id)}
				<div class="alert alert-warning">Panel not found: {id}</div>
			{/if}
		{/if}
	{:else if element.element_type === 'text'}
		<TextPanel {element} />
	{:else if element.element_type === 'image'}
		<ImageButton src={element.image_element.url} alt={element.image_element.alt_text} />
	{:else if element.element_type === 'table'}
		{@render table(element)}
	{:else if element.element_type === 'map'}
		<Map {element} />
	{:else}
		<div class="alert alert-warning">No renderer for element type!</div>
		<Debug data={element} />
	{/if}
</div>
