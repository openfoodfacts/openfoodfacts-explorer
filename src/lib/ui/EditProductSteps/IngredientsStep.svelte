<script lang="ts">
	import InfoTooltip from '../InfoTooltip.svelte';
	import type { Writable } from 'svelte/store';
	import type { Product } from '$lib/api';
	import ISO6391 from 'iso-639-1';
	import { PRODUCT_IMAGE_URL } from '$lib/const';
	import { _ } from '$lib/i18n';
	type Props = {
		productStore: Writable<Product>;
	};

	let { productStore }: Props = $props();

	let showInfoIngredients = $state(false);

	function hasRev(image: unknown): image is { rev: number } {
		return (
			typeof image === 'object' &&
			image !== null &&
			'rev' in image &&
			typeof (image as { rev: unknown }).rev === 'number'
		);
	}

	const getLanguage = ISO6391.getName;

	function getIngredientsImage(language: string) {
		const productData = $productStore;
		if (!productData.code || !productData.images) return null;
		const paddedBarcode = productData.code.toString().padStart(13, '0');
		const match = paddedBarcode.match(/^(.{3})(.{3})(.{3})(.*)$/);
		if (!match) return null;
		const path = `${match[1]}/${match[2]}/${match[3]}/${match[4]}`;
		const imageName = 'ingredients_' + language;
		const image = productData.images[imageName];
		if (!hasRev(image)) return null;
		const filename = `${imageName}.${image.rev}.400.jpg`;
		return PRODUCT_IMAGE_URL(`${path}/${filename}`);
	}
</script>

<div class="collapse-arrow bg-base-100 collapse shadow-md">
	<input type="checkbox" />
	<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
		<span class="icon-[mdi--format-list-bulleted] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
		{$_('product.edit.sections.ingredients')}
	</div>
	<div class="collapse-content">
		<button
			type="button"
			class="mb-2"
			aria-label="Info"
			onclick={() => (showInfoIngredients = !showInfoIngredients)}
		>
			<span
				class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
			></span>
		</button>
		{#if showInfoIngredients}
			<div
				class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
			>
				<span class="icon-[mdi--information] text-primary mt-0.5 flex-shrink-0"></span>
				<span class="text-base-content/80 p-4 text-sm sm:text-base"
					>{$_('product.edit.info.ingredients')}</span
				>
				<button
					type="button"
					class="hover:bg-primary/10 absolute top-2 right-2 rounded p-1"
					aria-label="Close"
					onclick={() => (showInfoIngredients = false)}
				>
					<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
				</button>
			</div>
		{/if}
		<div class="tabs tabs-box">
			{#each Object.keys($productStore.languages_codes ?? {}) as code (code)}
				<input
					type="radio"
					name="ingredients_tabs_edit"
					class="tab text-xs sm:text-sm"
					aria-label={getLanguage(code)}
					checked={code === $productStore.lang}
				/>
				<div class="tab-content form-control p-6">
					{#if getIngredientsImage(code)}
						<img src={getIngredientsImage(code)} alt="Ingredients" class="mb-4" />
					{:else}
						<p class="alert alert-warning mb-4 text-sm sm:text-base">
							{$_('product.edit.no_ingredients_image')}
						</p>
					{/if}
					<label class="label text-sm sm:text-base" for={`ingredients-list-edit-${code}`}>
						<span class="flex items-center gap-2">
							{$_('product.edit.ingredients_list')} ({getLanguage(code)})
							<InfoTooltip text={$_('product.edit.tooltips.ingredients_list')} />
						</span>
					</label>
					<div class="form-control mb-4">
						<textarea
							id={`ingredients-list-edit-${code}`}
							class="textarea textarea-bordered h-40 w-full text-sm sm:text-base"
							bind:value={$productStore[`ingredients_text_${code}`]}
						></textarea>
					</div>
				</div>
			{/each}
			{#if Object.keys($productStore.languages_codes ?? {}).length === 0}
				<div class="alert alert-warning text-sm sm:text-base">
					{$_('product.edit.no_languages_found')}
				</div>
			{/if}
		</div>
	</div>
</div>
