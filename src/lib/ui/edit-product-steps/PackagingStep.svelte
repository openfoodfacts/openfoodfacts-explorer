<script lang="ts">
	import { _ } from '$lib/i18n';
	// TODO: switch to SDK
	import type { PackagingComponent } from '$lib/api';

	import IconMdiPackageVariant from '@iconify-svelte/mdi/package-variant';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformationOutline from '@iconify-svelte/mdi/information';

	import PackagingImage from './PackagingImage.svelte';
	import PackagingRecyclingInstructions from './PackagingRecyclingInstructions.svelte';
	import PackagingComponentsEditor from './PackagingComponentsEditor.svelte';

	type Props = {
		packagings?: PackagingComponent[];
		packagingsComplete?: number;
		packagingText?: string;
		barcode?: string;
		lang?: string;
		getPackagingImage: (language: string) => string | null;
	};

	let {
		packagings = $bindable([]),
		packagingsComplete = $bindable(0),
		packagingText = $bindable(''),
		barcode = '',
		lang = 'en',
		getPackagingImage
	}: Props = $props();

	let showInfo = $state(false);
	function toggleInfo() {
		showInfo = !showInfo;
	}
</script>

<h2
	class="text-primary mb-6 items-center justify-center gap-2 text-center text-base font-bold md:text-lg lg:text-xl xl:text-2xl"
>
	<IconMdiPackageVariant class="mr-1 h-6 w-6 align-middle" />
	{$_('product.edit.sections.packaging', { default: 'Packaging' })}
	<button type="button" class="ml-2 align-middle" aria-label="Info" onclick={toggleInfo}>
		<IconMdiHelpCircleOutline
			class="hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
		/>
	</button>
</h2>
{#if showInfo}
	<div
		class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
	>
		<button
			type="button"
			class="hover:bg-primary/10 absolute top-2 right-2 m-2 rounded p-1"
			aria-label="Close"
			onclick={toggleInfo}
		>
			<IconMdiClose class="text-primary h-5 w-5" />
		</button>
		<IconMdiInformationOutline class="text-primary mt-0.5 h-6 w-6 flex-shrink-0" />
		<span class="text-base-content/80 p-6 text-sm sm:text-base">
			{$_('product.edit.info.packaging')}
		</span>
	</div>
{/if}

<PackagingImage {barcode} {lang} {getPackagingImage} />
<PackagingRecyclingInstructions bind:packagingText {lang} />
<PackagingComponentsEditor bind:packagings bind:packagingsComplete />
