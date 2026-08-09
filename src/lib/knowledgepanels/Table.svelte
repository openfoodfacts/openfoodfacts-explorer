<script lang="ts">
	import type { KnowledgeTableElement } from '$lib/api';
	import type { KnowledgePanelTableRow } from '$lib/types/sdk-overrides';
	import HtmlPurify from '$lib/ui/HtmlPurify.svelte';

	let { element }: { element: KnowledgeTableElement } = $props();
	let rows = $derived(element.table_element.rows as KnowledgePanelTableRow[]);
</script>

<div class="overflow-x-auto">
	<table class="table-compact table w-full">
		<thead>
			<tr>
				{#each element.table_element.columns as column, columnIndex (columnIndex)}
					<th><HtmlPurify dirty={column.text} /></th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row, rowIndex (rowIndex)}
				<tr>
					{#each row.values as cell, cellIndex (cellIndex)}
						<td>
							{#if cell.icon_url}
								<img src={cell.icon_url} class="row-item-icon" alt="icon" />
							{/if}
							<HtmlPurify dirty={cell.text} />
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.row-item-icon {
		font-size: 18px;
		vertical-align: middle;
		display: inline-block;
		overflow: hidden;
		width: 1em;
		height: 1em;
		margin-right: 0.25em;
		filter: brightness(0);
	}

	@media (prefers-color-scheme: dark) {
		.row-item-icon {
			filter: brightness(0) invert(1);
		}
	}
</style>
