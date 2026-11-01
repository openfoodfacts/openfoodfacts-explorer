<script lang="ts">
	import { _ } from '#lib/i18n/index.js';
	import ImageButton from '../ImageButton.svelte';
	import MissingImageUpload from './MissingImageUpload.svelte';

	type Props = {
		src: string | null | undefined;
		productCode: string;
		alt: string;
		lang: string;
		onImageUploaded?: () => Promise<void>;
	};

	let { src, productCode, alt, lang, onImageUploaded }: Props = $props();
</script>

<div class="mb-4">
	{#if src != null}
		<ImageButton {src} {productCode} {alt} />
	{:else}
		<MissingImageUpload
			message={$_('product.edit.packaging_component.no_packaging_image', {
				default: 'No packaging photo available. Upload one in the Images section above.'
			})}
			{productCode}
			imagefield={`packaging_${lang}`}
			onUploaded={onImageUploaded}
		/>
	{/if}
</div>
