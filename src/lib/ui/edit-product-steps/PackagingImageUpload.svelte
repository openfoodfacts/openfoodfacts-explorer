<script lang="ts">
	import { _ } from '$lib/i18n';
	import { getLanguageName } from '$lib/languages';
	import ImageButton from '../ImageButton.svelte';

	type Props = {
		barcode: string;
		lang: string;
		getPackagingImage: (language: string) => string | null;
	};

	let { barcode, lang, getPackagingImage }: Props = $props();

	let currentLang = $derived(lang || 'en');
</script>

<div class="mb-4">
	{#if getPackagingImage(currentLang) != null}
		<ImageButton
			src={getPackagingImage(currentLang) ?? undefined}
			productCode={barcode}
			alt={`Packaging photo for ${getLanguageName(currentLang)}`}
		/>
	{:else}
		<p class="alert alert-warning mb-4 text-sm sm:text-base">
			{$_('product.edit.packaging_component.no_packaging_image', {
				default: 'No packaging photo available. Upload one in the Images section above.'
			})}
		</p>
	{/if}
</div>
