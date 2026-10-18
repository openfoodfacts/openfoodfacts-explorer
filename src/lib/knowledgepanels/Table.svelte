<script lang="ts">
	import type { KnowledgeTableElement } from '#lib/api.js';
	import type { KnowledgePanelTableRow } from '#lib/types/sdk-overrides.js';
	import HtmlPurify from '#lib/ui/HtmlPurify.svelte';
	import { _ } from '#lib/i18n/index.js';

	let { element }: { element: KnowledgeTableElement } = $props();
	let rows = $derived(element.table_element.rows as KnowledgePanelTableRow[]);
	let query = $state('');
	let filterable = $derived(element.table_element.id === 'product_history_table');
	let shown = $derived(
		query
			? rows.filter((row) =>
					row.values.some((cell) => cell.text?.toLowerCase().includes(query.toLowerCase()))
				)
			: rows
	);
	let label = $derived(
		$_('product.knowledge_panels.history_filter', { default: 'Filter by contributor or comment' })
	);
</script>

{#if filterable}
	<input
		type="search"
		class="input-bordered input mb-2 w-full"
		bind:value={query}
		placeholder={label}
		aria-label={label}
	/>
{/if}

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
			{#each shown as row, rowIndex (rowIndex)}
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
							{#if cell.url && /^https?:\/\//.test(cell.url)}
								<a class="link" href={cell.url}><HtmlPurify dirty={cell.text} /></a>
							{:else}
								<HtmlPurify dirty={cell.text} />
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
