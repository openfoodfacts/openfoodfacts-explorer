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
								<img
									src={cell.icon_url}
									class="mr-1 inline-block h-[1em] w-[1em] overflow-hidden align-middle text-[18px] brightness-0 dark:invert"
									alt=""
									aria-hidden="true"
								/>
							{/if}
							<HtmlPurify dirty={cell.text} />
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
