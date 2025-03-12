<script lang="ts">
	import type { KnowledgeElement, KnowledgePanel } from '$lib/api';
	import Debug from '$lib/ui/Debug.svelte';

	import Panel from './Panel.svelte';
	import Map from './Map.svelte';
	import TextPanel from './TextElement.svelte';
	import PanelGroup from './PanelGroup.svelte';
	import ImageButton from '$lib/ui/ImageButton.svelte';
	import Action from './Action.svelte';

	type Props = {
		allPanels: Record<string, KnowledgePanel>;
		element: KnowledgeElement;
	};
	let { allPanels, element }: Props = $props();
</script>

<div class="my-1">
	{#if element.element_type === 'panel_group'}
		<PanelGroup {element} {allPanels} />
	{:else if element.element_type === 'panel' || element.element_type === 'action'}
		<Action {element} {allPanels} />
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
	{:else if element.element_type === 'map'}
		<Map {element} />
	{:else}
		<div class="alert alert-warning">No renderer for element type!</div>
		<Debug data={element} />
	{/if}
</div>
