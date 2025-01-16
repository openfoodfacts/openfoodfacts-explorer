<script lang="ts">
	import type { KnowledgeElement, KnowledgePanel, KnowledgePanelSize } from '$lib/api';
	import Debug from '$lib/ui/Debug.svelte';

	import Panel from './Panel.svelte';
	import Map from './Map.svelte';
	import TextPanel from './TextElement.svelte';
	import PanelGroup from './PanelGroup.svelte';
	import ImageButton from '$lib/ui/ImageButton.svelte';

	type Props = {
		allPanels: Record<string, KnowledgePanel>;
		element: KnowledgeElement;
		size?: KnowledgePanelSize;
	};
	let { allPanels, element, size }: Props = $props();
</script>

<div class="my-1">
	{#if element.element_type === 'panel_group'}
		<PanelGroup {element} {allPanels} />
	{:else if element.element_type === 'panel'}
		{@const id = element.panel_element.panel_id}
		{@const panel = allPanels[id]}
		<Panel {panel} {allPanels} {id} />
	{:else if element.element_type === 'text'}
		<TextPanel {element} />
	{:else if element.element_type === 'image'}
		<ImageButton src={element.image_element.url} alt={element.image_element.alt_text} />
	{:else if element.element_type === 'table'}
		<div class="overflow-x-auto">
			<table class="table-compact table w-full">
				<thead>
					<tr>
						<th></th>
						{#each element.table_element.columns as column}
							<th>{column.text}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each element.table_element.rows as row}
						<tr>
							<td></td>
							{#each row.values as cell}
								<td>{cell.text}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else if element.element_type === 'action'}
		<button class="btn btn-primary">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html element.action_element.html}
		</button>
	{:else if element.element_type === 'map'}
		<Map {element} />
	{:else}
		<div class="alert alert-warning">No renderer for element type!</div>
		<Debug data={element} />
	{/if}
</div>
