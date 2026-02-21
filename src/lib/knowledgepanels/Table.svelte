<script lang="ts">
	import type { KnowledgeElementTable } from '$lib/api';
	import { sanitizeHtml } from '$lib/sanitize';

	let { element }: { element: KnowledgeElementTable } = $props();
</script>

<div class="overflow-x-auto">
	<table class="table-compact table w-full">
		<thead>
			<tr>
				{#each element.table_element.columns as column, columnIndex (columnIndex)}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<th>{@html sanitizeHtml(column.text)}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each element.table_element.rows as row, rowIndex (rowIndex)}
				<tr>
					{#each row.values as cell, cellIndex (cellIndex)}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						<td>{@html sanitizeHtml(cell.text)}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
