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
	import type { KnowledgePanelElement, KnowledgePanels } from '$lib/api';
	import Panel from './Panel.svelte';

	type Props = {
		panels: KnowledgePanels;
		code?: string;
		summary?: boolean;
		roots?: string[];
		onAllPanelsExpandedChange?: (expanded: boolean) => void;
	};

	let { panels, code, summary = true, roots, onAllPanelsExpandedChange }: Props = $props();

	let expandedPanels = $state<Record<string, boolean>>({});
	let expansionProductCode = $state<string | undefined>();

	$effect(() => {
		if (code !== expansionProductCode) {
			expandedPanels = {};
			expansionProductCode = code;
		}
	});

	let allPanelsExpanded = $derived.by(() => {
		const panelIds = Object.keys(panels);

		return (
			panelIds.length > 0 &&
			panelIds.every((id) => expandedPanels[id] ?? panels[id]?.expanded ?? false)
		);
	});

	$effect(() => {
		onAllPanelsExpandedChange?.(allPanelsExpanded);
	});

	function handlePanelExpansionChange(id: string, expanded: boolean) {
		expandedPanels = { ...expandedPanels, [id]: expanded };
	}

	export function toggleAllPanels() {
		const expanded = !allPanelsExpanded;
		expandedPanels = Object.fromEntries(Object.keys(panels).map((id) => [id, expanded]));
	}

	const SUMMARY_ID = 'knowledge-panels';

	let rootPanels = $derived(
		roots == null
			? panels
			: Object.fromEntries(
					Object.entries(panels).filter(
						([id, panel]) =>
							roots.includes(id) || (panel.type != null && roots.includes(panel.type))
					)
				)
	);

	let sections = $derived.by(() => {
		const toDisplay = Object.entries(rootPanels)
			.map(([_, panel]) => panel.elements ?? [])
			.flat()
			.filter(
				(it): it is KnowledgePanelElement =>
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
		<div class="absolute ms-5 max-w-max rounded-xl bg-secondary px-4 text-secondary-content">
			Summary
		</div>

		<div class="mt-3 border-b-2 border-dashed border-secondary"></div>

		<div class="my-4 flex flex-row flex-wrap justify-center gap-2 md:gap-4" id={SUMMARY_ID}>
			{#each sections as [panelKey, panel] (panelKey)}
				<a class="btn text-lg btn-secondary" href={'#' + panelKey}>
					{panel.title_element!.title}
				</a>
			{/each}
		</div>

		<div class="border-b-2 border-dashed border-secondary"></div>
	</div>
{/if}

{#each Object.entries(panels) as [id, panel] (id)}
	{#if roots == null || roots.includes(id) || (panel.type != null && roots.includes(panel.type))}
		<Panel
			{panel}
			{panels}
			{id}
			link={'#' + SUMMARY_ID}
			productCode={code}
			{expandedPanels}
			onPanelExpansionChange={handlePanelExpansionChange}
			inline
		/>
	{/if}
{/each}
