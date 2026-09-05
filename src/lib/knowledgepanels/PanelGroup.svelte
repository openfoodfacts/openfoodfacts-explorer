<script lang="ts">
	import type { KnowledgePanelGroupElement, KnowledgePanels } from '$lib/api';
	import ImageButton from '$lib/ui/ImageButton.svelte';
	import Panel from './Panel.svelte';

	let {
		element,
		panels: panels,
		code: code,
		expandedPanels,
		onPanelExpansionChange
	}: {
		element: KnowledgePanelGroupElement;
		panels: KnowledgePanels;
		/** Optional product code to enable product-specific features like product links */
		code?: string;
		expandedPanels?: Record<string, boolean>;
		onPanelExpansionChange?: (id: string, expanded: boolean) => void;
	} = $props();

	let groupEl = $derived(element.panel_group_element);
	let previewImageUrl = $derived(
		groupEl.image?.sizes['400']?.url ??
			groupEl.image?.sizes['200']?.url ??
			groupEl.image?.sizes['100']?.url ??
			groupEl.image?.sizes['full']?.url
	);
</script>

<h3 class="my-3 text-lg font-bold sm:text-xl">{groupEl.title}</h3>
<div class="flex flex-col gap-4 md:flex-row">
	<div class="flex grow flex-col gap-2">
		{#each groupEl.panel_ids as id (id)}
			{@const panel = panels[id]}
			<Panel {panel} {panels} {id} productCode={code} {expandedPanels} {onPanelExpansionChange} />
		{/each}
	</div>

	{#if groupEl.image != null && previewImageUrl != null}
		{@const parsedImageId = Number(groupEl.image.id)}
		<div class="md:max-w-64">
			<ImageButton
				src={previewImageUrl}
				alt={groupEl.image.alt}
				rawImageId={Number.isFinite(parsedImageId) ? parsedImageId : undefined}
				productCode={code}
			/>
		</div>
	{/if}
</div>
