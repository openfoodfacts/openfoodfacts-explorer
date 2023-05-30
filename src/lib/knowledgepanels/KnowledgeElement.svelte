<script lang="ts">
	import type { KnowledgeElement, KnowledgePanel } from './knowledgepanels';
	import Panel from './KnowledgePanel.svelte';
	import TextPanel from './TextElement.svelte';

	export let allPanels: Record<string, KnowledgePanel>;
	export let element: KnowledgeElement;
</script>

<div class="my-1">
	{#if element.element_type === 'panel_group'}
		<h3 class="text-xl font-bold my-3">{element.panel_group_element.title}</h3>

		{#each element.panel_group_element.panel_ids as id}
			{@const panel = allPanels[id]}
			<Panel {panel} {allPanels} {id} />
		{/each}
	{:else if element.element_type === 'panel'}
		{@const id = element.panel_element.panel_id}
		{@const panel = allPanels[id]}
		<Panel {panel} {allPanels} {id} />
	{:else if element.element_type === 'text'}
		<TextPanel {element} />
	{:else if element.element_type === 'image'}
		<img src={element.image_element.url} alt={element.image_element.alt_text} />
	{:else if element.element_type === 'table'}
		<div class="overflow-x-auto">
			<table class="table w-full table-compact">
				<thead>
					<tr>
						<th />
						{#each element.table_element.columns as column}
							<th>{column.text}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each element.table_element.rows as row}
						<tr>
							<td />
							{#each row.values as cell}
								<td>{cell.text}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else if element.element_type === 'action'}
		<button class="btn btn-primary">{@html element.action_element.html}</button>
	{:else}
		{JSON.stringify(element)}
	{/if}
</div>
