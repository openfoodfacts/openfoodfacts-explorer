<script lang="ts">
	import { _ } from '#lib/i18n/index.js';
	import ImageButton from '../ImageButton.svelte';
	import type { ImageSizes } from '../imageSizes.js';

	type Props = {
		src: string | null | undefined;
		imageSizes?: ImageSizes;
		productCode: string;
		alt: string;
	};

	let { src, imageSizes, productCode, alt }: Props = $props();
</script>

<div class="mb-4">
	{#if src != null}
		<ImageButton {src} {imageSizes} {productCode} {alt} />
	{:else}
		<p class="mb-4 alert text-sm alert-warning sm:text-base">
			{$_('product.edit.packaging_component.no_packaging_image', {
				default: 'No packaging photo available. Upload one in the Images section above.'
			})}
		</p>
	{/if}
</div>
