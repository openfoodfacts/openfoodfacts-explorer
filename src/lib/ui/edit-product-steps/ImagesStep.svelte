<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';

	import PhotoManager from '../images/PhotoManager.svelte';

	import IconMdiImageMultiple from '@iconify-svelte/mdi/image-multiple';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiAlertCircle from '@iconify-svelte/mdi/alert-circle';

	type Props = { product: Product; editMode?: boolean };
	let { product = $bindable(), editMode = false }: Props = $props();

	let showInfo = $state(false);
	const toggleInfo = () => {
		showInfo = !showInfo;
	};
</script>

{#if !editMode}
	<h2
		class="mb-6 flex items-center justify-center gap-2 text-center text-base font-bold text-primary md:text-lg lg:text-xl xl:text-2xl"
	>
		<IconMdiImageMultiple class="mr-1 h-6 w-6 align-middle" />
		{$_('product.edit.sections.images')}
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
			<IconMdiInformation class="mt-0.5 h-6 w-6 shrink-0 text-primary" />
			<span class="p-6 text-sm text-base-content/80 sm:text-base">
				{$_('product.edit.info.images')}
			</span>
		</div>
	{/if}
{/if}

<!-- Legal warning about photo copyright -->
<div class="mb-4 alert alert-error" role="alert">
	<IconMdiAlertCircle class="h-6 w-6" />
	<div>
		<h4 class="text-xl font-bold">{$_('product.edit.legal_warning_title')}</h4>
		<p class="mt-1">{$_('product.edit.legal_warning_photos_1')}</p>
		<p class="mt-1 font-bold">{$_('product.edit.legal_warning_photos_2')}</p>
	</div>
</div>

{#key product.code}
	<PhotoManager {product} />
{/key}
