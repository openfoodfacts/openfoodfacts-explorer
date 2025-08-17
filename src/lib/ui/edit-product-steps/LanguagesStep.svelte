<script lang="ts">
	import type { Writable } from 'svelte/store';

	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';

	import InfoTooltip from '../InfoTooltip.svelte';

	type Props = {
		productStore: Writable<Product>;
		filteredLanguages: string[];
		addLanguage: (code: string) => void;
		getLanguage: (code: string) => string;
	};

	let { productStore, filteredLanguages, addLanguage, getLanguage }: Props = $props();

	// Local state for language search input
	let languageSearch = $state('');

	let showInfo = $state(false);
	function toggleInfo() {
		showInfo = !showInfo;
	}
</script>

<h2
	class="text-primary mb-6 items-center justify-center gap-2 text-center text-base font-bold md:text-lg lg:text-xl xl:text-2xl"
>
	<span class="icon-[mdi--translate] mr-1 h-6 w-6 align-middle"></span>
	{$_('product.edit.sections.languages')}
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
		<span class="text-base-content/80 p-6 text-sm sm:text-base"
			>{$_('product.edit.info.languages')}</span
		>
	</div>
{/if}
<div class="collapse-arrow bg-base-200 collapse">
	<input type="checkbox" />
	<div class="collapse-title text-sm font-semibold sm:text-base">
		{$_('product.edit.add_language')}
	</div>
	<div class="collapse-content">
		<label class="input w-full text-sm sm:text-base">
			<span class="icon-[mdi--search] h-5 w-5"></span>
			<input
				type="search"
				placeholder={$_('product.edit.search_languages')}
				bind:value={languageSearch}
				class="text-sm sm:text-base"
			/>
		</label>
		{#if filteredLanguages.length === 0}
			<p class="mt-4 text-center text-sm opacity-70 sm:text-base">
				{$_('product.edit.no_languages_found')}
			</p>
		{:else}
			<div
				class="mt-2 grid max-h-96 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 overflow-auto sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]"
			>
				{#each filteredLanguages as code (code)}
					<button class="btn btn-ghost text-xs sm:text-sm" onclick={() => addLanguage(code)}>
						{getLanguage(code)}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
<div class="tabs tabs-box mt-4">
	{#each Object.keys($productStore.languages_codes ?? {}) as code (code)}
		<input
			type="radio"
			name="name_tabs"
			class="tab text-xs sm:text-sm"
			aria-label={getLanguage(code)}
			checked={code === $productStore.lang}
		/>
		<div class="tab-content form-control p-6">
			<label class="label text-sm sm:text-base" for={`product-name-${code}`}>
				<span class="flex items-center gap-2">
					{$_('product.edit.name')} ({getLanguage(code)})
					<InfoTooltip text={$_('product.edit.tooltips.product_name')} />
				</span>
			</label>
			<input
				id={`product-name-${code}`}
				type="text"
				class="input input-bordered w-full text-sm sm:text-base"
				bind:value={$productStore[`product_name_${code}`]}
			/>
		</div>
	{/each}
	{#if Object.keys($productStore.languages_codes ?? {}).length === 0}
		<div class="alert alert-warning text-sm sm:text-base">
			{$_('product.edit.no_languages_found')}
		</div>
	{/if}
</div>
