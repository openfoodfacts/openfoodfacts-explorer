<script lang="ts">
	import type { KnowledgePanelGroupElement, KnowledgePanels } from '#lib/api.js';
	import ImageButton from '#lib/ui/ImageButton.svelte';
	import Panel from './Panel.svelte';

	let {
		element,
		panels: panels,
		code: code,
		headingLevel
	}: {
		element: KnowledgePanelGroupElement;
		panels: KnowledgePanels;
		/** Optional product code to enable product-specific features like product links */
		code?: string;
		headingLevel: number;
	} = $props();

	let groupEl = $derived(element.panel_group_element);
	let previewImageUrl = $derived(
		groupEl.image?.sizes['400']?.url ??
			groupEl.image?.sizes['200']?.url ??
			groupEl.image?.sizes['100']?.url ??
			groupEl.image?.sizes['full']?.url
	);
</script>

{#if groupEl.title?.trim()}
	<svelte:element
		this={`h${Math.min(headingLevel + 1, 6)}`}
		class="my-3 text-lg font-bold sm:text-xl"
	>
		{groupEl.title}
	</svelte:element>
{/if}
<div class="flex flex-col gap-4 md:flex-row">
	<div class="flex grow flex-col gap-2">
		{#each groupEl.panel_ids as id (id)}
			{@const panel = panels[id]}
			<Panel
				{panel}
				{panels}
				{id}
				productCode={code}
				headingLevel={Math.min(headingLevel + (groupEl.title?.trim() ? 2 : 1), 6)}
			/>
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
