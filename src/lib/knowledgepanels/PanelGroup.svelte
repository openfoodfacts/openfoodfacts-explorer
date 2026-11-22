<script lang="ts">
	import type { KnowledgePanelGroupElement, KnowledgePanels } from '#lib/api.js';
	import ImageButton from '#lib/ui/ImageButton.svelte';
	import ImageBackdrop from '#lib/ui/ImageBackdrop.svelte';
	import { getPanelImageSizes } from '#lib/ui/imageSizes.js';
	import Panel from './Panel.svelte';

	let {
		element,
		panels: panels,
		code: code
	}: {
		element: KnowledgePanelGroupElement;
		panels: KnowledgePanels;
		/** Optional product code to enable product-specific features like product links */
		code?: string;
	} = $props();

	let groupEl = $derived(element.panel_group_element);
	let previewImageUrl = $derived(
		groupEl.image?.sizes['400']?.url ??
			groupEl.image?.sizes['200']?.url ??
			groupEl.image?.sizes['100']?.url
	);
</script>

<h3 class="my-3 text-lg font-bold sm:text-xl">{groupEl.title}</h3>
<div class="flex flex-col gap-4 md:flex-row">
	<div class="flex grow flex-col gap-2">
		{#each groupEl.panel_ids as id, index (`${index}:${id}`)}
			{@const panel = panels[id]}
			{#if panel != null}
				<Panel {panel} {panels} {id} productCode={code} />
			{/if}
		{/each}
	</div>

	{#if groupEl.image != null && previewImageUrl != null}
		{@const parsedImageId = Number(groupEl.image.id)}
		<div
			class="relative aspect-2/1 w-full overflow-hidden rounded-xl bg-base-100 md:aspect-square md:max-w-64 [&>div]:size-full [&>div_button]:size-full [&>div_img]:size-full [&>div_img]:object-contain [&>div>button>div]:size-full"
		>
			<ImageBackdrop
				src={previewImageUrl}
				imageSizes={getPanelImageSizes(groupEl.image.sizes)}
				sizes="(min-width: 768px) 256px, 100vw"
			/>
			<ImageButton
				src={previewImageUrl}
				imageSizes={getPanelImageSizes(groupEl.image.sizes)}
				sizes="(min-width: 768px) 256px, 100vw"
				alt={groupEl.image.alt}
				rawImageId={Number.isFinite(parsedImageId) ? parsedImageId : undefined}
				productCode={code}
			/>
		</div>
	{/if}
</div>
