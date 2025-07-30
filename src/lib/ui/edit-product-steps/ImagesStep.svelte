<script lang="ts">
	import PhotoManager from '../PhotoManager.svelte';
	import type { Writable } from 'svelte/store';
	import type { Product } from '$lib/api';
	import { _ } from '$lib/i18n';

	let showInfoImages = $state(false);

	let { productStore }: { productStore: Writable<Product> } = $props();
</script>

<div class="collapse-arrow bg-base-100 collapse shadow-md">
	<input type="checkbox" />
	<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
		<span class="icon-[mdi--image-multiple] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
		{$_('product.edit.sections.images')}
	</div>
	<div class="collapse-content">
		<button
			type="button"
			class="mb-2"
			aria-label="Info"
			onclick={() => (showInfoImages = !showInfoImages)}
		>
			<span
				class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
			></span>
		</button>
		{#if showInfoImages}
			<div
				class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
			>
				<span class="icon-[mdi--information] text-primary mt-0.5 flex-shrink-0"></span>
				<span class="text-base-content/80 p-4 text-sm sm:text-base"
					>{$_('product.edit.info.images')}</span
				>
				<button
					type="button"
					class="hover:bg-primary/10 absolute top-2 right-2 rounded p-1"
					aria-label="Close"
					onclick={() => (showInfoImages = false)}
				>
					<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
				</button>
			</div>
		{/if}
		<PhotoManager product={$productStore} />
	</div>
</div>
