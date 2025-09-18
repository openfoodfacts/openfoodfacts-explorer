<!--
@component
This component displays knowledge panels.
It can show a summary of the panels at the top, with links to each panel section.

Props:
- `panels: Record<string, KnowledgePanel>` - The knowledge panels to display.
- `code?: string` - The product code associated with the panels (optional).
- `summary?: boolean` - Whether to show a summary of the panels at the top (default: true).
- `roots?: string[]` - An array of root panel types to filter which panels to display.
  If not provided, all panels are displayed.
-->
<script lang="ts">
	import type { KnowledgeElementPanel, KnowledgePanel } from '$lib/api';
	import Panel from './Panel.svelte';

	type Props = {
		panels: Record<string, KnowledgePanel>;
		code?: string;
		summary?: boolean;
		roots?: string[];
	};

	let { panels, code, summary = true, roots }: Props = $props();

	const SUMMARY_ID = 'knowledge-panels';

	let rootPanels = $derived(
		roots == null
			? panels
			: Object.fromEntries(
					Object.entries(panels).filter(([_, panel]) => panel.type && roots.includes(panel.type))
				)
	);

	let sections = $derived.by(() => {
		const toDisplay = Object.entries(rootPanels)
			.map(([_, panel]) => panel.elements ?? [])
			.flat()
			.filter(
				(it): it is KnowledgeElementPanel =>
					it.element_type === 'panel' && it.panel_element?.panel_id in panels
			)
			.map((it) => it.panel_element?.panel_id);

		return Object.entries(panels).filter(
			([id, panel]) => id && toDisplay.includes(id) && panel.title_element
		);
	});
</script>

{#if summary}
	<div>
		<div class="bg-secondary text-secondary-content absolute ms-5 max-w-max rounded-xl px-4">
			Summary
		</div>

		<div class="border-secondary mt-3 border-b-2 border-dashed"></div>

		<div class="my-4 flex flex-row flex-wrap justify-center gap-2 md:gap-4" id={SUMMARY_ID}>
			{#each sections as [panelKey, panel] (panelKey)}
				<a class="btn btn-secondary text-lg" href={'#' + panelKey}>
					{panel.title_element!.title}
				</a>
			{/each}
		</div>

		<div class="border-secondary border-b-2 border-dashed"></div>
	</div>
{/if}

{#each Object.entries(panels) as [id, panel] (id)}
	{#if roots == null || (panel.type != null && roots.includes(panel.type))}
		<Panel {panel} allPanels={panels} {id} link={'#' + SUMMARY_ID} productCode={code} inline />
	{/if}
{/each}
