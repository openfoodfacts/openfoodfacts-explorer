<script lang="ts">
	import type { KnowledgeElementTable } from '$lib/api';
	import HtmlPurify from '$lib/ui/HtmlPurify.svelte';

	let { element }: { element: KnowledgeElementTable } = $props();
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
			{#each element.table_element.rows as row, rowIndex (rowIndex)}
				<tr>
					{#each row.values as cell, cellIndex (cellIndex)}
						<td><HtmlPurify dirty={cell.text} /></td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
