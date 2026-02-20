<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';

	import PhotoManager from '../images/PhotoManager.svelte';

	import IconMdiImageMultiple from '@iconify-svelte/mdi/image-multiple';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiAlertCircle from '@iconify-svelte/mdi/alert-circle';
	import { legalBannerDismissed } from '$lib/stores/preferencesStore';

	type Props = { product: Product };
	let { product = $bindable() }: Props = $props();

	let showInfo = $state(false);
	const toggleInfo = () => {
		showInfo = !showInfo;
	};
</script>

<h2
	class="text-primary mb-6 flex items-center justify-center gap-2 text-center text-base font-bold md:text-lg lg:text-xl xl:text-2xl"
>
	<IconMdiImageMultiple class="mr-1 h-6 w-6 align-middle" />
	{$_('product.edit.sections.images')}
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
		<IconMdiInformation class="text-primary mt-0.5 h-6 w-6 flex-shrink-0" />
		<span class="text-base-content/80 p-6 text-sm sm:text-base">
			{$_('product.edit.info.images')}
		</span>
	</div>
{/if}

<!-- Legal warning about photo copyright -->
{#if !$legalBannerDismissed}
	<div class="alert alert-error mb-4" role="alert">
		<IconMdiAlertCircle class="h-6 w-6" />
		<div>
			<h4 class="text-xl font-bold">{$_('product.edit.legal_warning_title')}</h4>
			<p class="mt-1">{$_('product.edit.legal_warning_photos_1')}</p>
			<p class="mt-1 font-bold">{$_('product.edit.legal_warning_photos_2')}</p>
		</div>
		<button
			type="button"
			class="btn btn-ghost btn-sm ml-auto shrink-0"
			onclick={() => ($legalBannerDismissed = true)}
		>
			{$_('product.edit.legal_warning_understood', { default: 'Understood' })}
		</button>
	</div>
{/if}

{#key product.code}
	<PhotoManager {product} />
{/key}
