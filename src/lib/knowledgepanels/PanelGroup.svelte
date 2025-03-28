<script lang="ts">
	import type { KnowledgePanel, KnowledgePanelGroupElement } from '$lib/api';
	import ImageButton from '$lib/ui/ImageButton.svelte';
	import Panel from './Panel.svelte';

	let {
		element,
		allPanels,
		productCode
	}: {
		element: KnowledgePanelGroupElement;
		allPanels: Record<string, KnowledgePanel>;
		productCode?: string;
	} = $props();

	let groupEl = $derived(element.panel_group_element);
</script>

<div class="flex flex-col gap-4 md:flex-row">
	<div class="grow">
		<h3 class="my-3 text-lg font-bold sm:text-xl">{groupEl.title}</h3>
		{#each groupEl.panel_ids as id (id)}
			{@const panel = allPanels[id]}
			<Panel {panel} {allPanels} {id} {productCode} />
		{/each}
	</div>

	{#if groupEl.image != null}
		<div class="md:max-w-64">
			<ImageButton src={groupEl.image.sizes['full'].url} alt={groupEl.image.alt} />
		</div>
	{/if}
</div>
