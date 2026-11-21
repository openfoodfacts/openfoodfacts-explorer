<script lang="ts">
	import type { KnowledgeTableElement } from '#lib/api.js';
	import type { KnowledgePanelTableRow } from '#lib/types/sdk-overrides.js';
	import { _ } from '#lib/i18n/index.js';
	import Table from './Table.svelte';

	let { element }: { element: KnowledgeTableElement } = $props();
	let rows = $derived(element.table_element.rows as KnowledgePanelTableRow[]);
	let contributorOrComment = $state('');
	let matchingRows = $derived.by(() => {
		const query = contributorOrComment.toLowerCase();
		if (!query) return rows;
		return rows.filter((row) =>
			row.values.some((cell) => cell.text?.toLowerCase().includes(query))
		);
	});
	let label = $derived(
		$_('product.knowledge_panels.history_filter', { default: 'Filter by contributor or comment' })
	);
</script>

<input
	type="search"
	class="input-bordered input mb-2 w-full"
	bind:value={contributorOrComment}
	placeholder={label}
	aria-label={label}
/>

<Table element={{ ...element, table_element: { ...element.table_element, rows: matchingRows } }} />
