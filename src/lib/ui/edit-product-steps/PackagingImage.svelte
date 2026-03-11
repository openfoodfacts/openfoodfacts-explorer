<script lang="ts">
	import { _ } from '$lib/i18n';
	import ImageButton from '../ImageButton.svelte';

	type Props = {
		src: string | null | undefined;
		productCode: string;
		alt: string;
	};

	let { src, productCode, alt }: Props = $props();
</script>

<div class="mb-4">
	{#if src != null}
		<ImageButton {src} {productCode} {alt} />
	{:else}
		<p class="alert alert-warning mb-4 text-sm sm:text-base">
			{$_('product.edit.packaging_component.no_packaging_image', {
				default: 'No packaging photo available. Upload one in the Images section above.'
			})}
		</p>
	{/if}
</div>
