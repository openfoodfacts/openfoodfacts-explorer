<script lang="ts">
	import type { KnowledgeElementPanelGroup, KnowledgePanel } from '$lib/api';
	import ImageButton from '$lib/ui/ImageButton.svelte';
	import Panel from './Panel.svelte';

	let {
		element,
		panels: panels,
		code: code
	}: {
		element: KnowledgeElementPanelGroup;
		panels: Record<string, KnowledgePanel>;
		/** Optional product code to enable product-specific features like product links */
		code?: string;
	} = $props();

	let groupEl = $derived(element.panel_group_element);
</script>

<h3 class="my-3 text-lg font-bold sm:text-xl">{groupEl.title}</h3>
<div class="flex flex-col gap-4 md:flex-row">
	<div class="flex grow flex-col gap-2">
		{#each groupEl.panel_ids as id (id)}
			{@const panel = panels[id]}
			<Panel {panel} {panels} {id} productCode={code} />
		{/each}
	</div>

	{#if groupEl.image != null}
		<div class="md:max-w-64">
			<ImageButton
				src={groupEl.image.sizes['full'].url}
				alt={groupEl.image.alt}
				rawImageId={groupEl.image.id}
				productCode={code}
			/>
		</div>
	{/if}
</div>
