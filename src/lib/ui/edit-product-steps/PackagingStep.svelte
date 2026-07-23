<script lang="ts">
	import { _ } from '$lib/i18n';
	// TODO: switch to SDK
	import type { Product } from '$lib/api';

	import IconMdiPackageVariant from '@iconify-svelte/mdi/package-variant';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformationOutline from '@iconify-svelte/mdi/information';

	import PackagingImage from './PackagingImage.svelte';
	import PackagingRecyclingInstructions from './PackagingRecyclingInstructions.svelte';
	import PackagingComponentsEditor from './PackagingComponentsEditor.svelte';

	type Props = {
		product: Product;
		getPackagingImage: (language: string) => string | null;
		editMode?: boolean;
	};

	let { product = $bindable(), getPackagingImage, editMode = false }: Props = $props();

	let showInfo = $state(false);
	function toggleInfo() {
		showInfo = !showInfo;
	}
</script>

{#if !editMode}
	<h2
		class="mb-6 items-center justify-center gap-2 text-center text-base font-bold text-primary md:text-lg lg:text-xl xl:text-2xl"
	>
		<IconMdiPackageVariant class="mr-1 h-6 w-6 align-middle" />
		{$_('product.edit.sections.packaging', { default: 'Packaging' })}
		<button type="button" class="ml-2 align-middle" aria-label="Info" onclick={toggleInfo}>
			<IconMdiHelpCircleOutline
				class="ml-4 h-6 w-6 text-primary hover:cursor-pointer hover:text-primary/70"
			/>
		</button>
	</h2>
	{#if showInfo}
		<div
			class="relative mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary-content shadow-sm"
		>
			<button
				type="button"
				class="absolute top-2 right-2 m-2 rounded p-1 hover:bg-primary/10"
				aria-label="Close"
				onclick={toggleInfo}
			>
				<IconMdiClose class="h-5 w-5 text-primary" />
			</button>
			<IconMdiInformationOutline class="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
			<span class="p-6 text-sm text-base-content/80 sm:text-base">
				{$_('product.edit.info.packaging')}
			</span>
		</div>
	{/if}
{/if}

<PackagingImage
	src={getPackagingImage(product.lang || 'en')}
	productCode={product.code}
	alt={`Packaging photo (${product.lang || 'en'})`}
/>
<PackagingRecyclingInstructions bind:product />
<PackagingComponentsEditor bind:product />
