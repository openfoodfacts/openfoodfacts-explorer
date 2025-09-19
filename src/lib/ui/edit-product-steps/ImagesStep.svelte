<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';

	import PhotoManager from '../images/PhotoManager.svelte';

	type Props = { product: Product };
	let { product = $bindable() }: Props = $props();

	let showInfo = $state(false);
	const toggleInfo = () => {
		showInfo = !showInfo;
	};
</script>

<h2
	class="text-primary mb-6 items-center justify-center gap-2 text-center text-base font-bold md:text-lg lg:text-xl xl:text-2xl"
>
	<span class="icon-[mdi--image-multiple] mr-1 h-6 w-6 align-middle"></span>
	{$_('product.edit.sections.images')}
	<button type="button" class="ml-2 align-middle" aria-label="Info" onclick={toggleInfo}>
		<span
			class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
		></span>
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
			<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
		</button>
		<span class="icon-[mdi--information] text-primary mt-0.5 h-6 w-6 flex-shrink-0"></span>
		<span class="text-base-content/80 p-6 text-sm sm:text-base">
			{$_('product.edit.info.images')}
		</span>
	</div>
{/if}

<!-- Legal warning about photo copyright -->
<div class="alert alert-error mb-4" role="alert">
	<span class="icon-[mdi--alert-circle] text-xl"></span>
	<div>
		<h4 class="text-xl font-bold">{$_('product.edit.legal_warning_title')}</h4>
		<p class="mt-1">{$_('product.edit.legal_warning_photos_1')}</p>
		<p class="mt-1 font-bold">{$_('product.edit.legal_warning_photos_2')}</p>
	</div>
</div>

<PhotoManager {product} />
