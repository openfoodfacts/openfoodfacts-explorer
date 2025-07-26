<script lang="ts">
	import InfoTooltip from '../InfoTooltip.svelte';
	import type { Writable } from 'svelte/store';
	import type { Product } from '$lib/api';
	import ISO6391 from 'iso-639-1';
	import { _ } from '$lib/i18n';

	type Props = {
		productStore: Writable<Product>;
	};

	let { productStore }: Props = $props();

	let showInfoLanguages = $state(false);

	// Language section state
	const languageCodes = ISO6391.getAllCodes();
	let languageSearch = $state('');
	let filteredLanguages = $state(languageCodes);

	$effect(() => {
		const search = languageSearch.toLowerCase();
		filteredLanguages = languageCodes.filter((code) => {
			if ($productStore.languages_codes?.[code] !== undefined) return false;
			return ISO6391.getName(code).toLowerCase().includes(search);
		});
	});

	function addLanguage(code: string) {
		productStore.update((store) => {
			store.languages_codes = { ...store.languages_codes, [code]: 0 };
			return store;
		});
	}

	const getLanguage = ISO6391.getName;
</script>

<div class="collapse-arrow bg-base-100 collapse shadow-md">
	<input type="checkbox" />
	<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
		<span class="icon-[mdi--translate] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
		{$_('product.edit.sections.languages')}
	</div>
	<div class="collapse-content">
		<button
			type="button"
			class="mb-2"
			aria-label="Info"
			onclick={() => (showInfoLanguages = !showInfoLanguages)}
		>
			<span
				class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
			></span>
		</button>
		{#if showInfoLanguages}
			<div
				class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
			>
				<span class="icon-[mdi--information] text-primary mt-0.5 flex-shrink-0"></span>
				<span class="text-base-content/80 p-4 text-sm sm:text-base"
					>{$_('product.edit.info.languages')}</span
				>
				<button
					type="button"
					class="hover:bg-primary/10 absolute top-2 right-2 rounded p-1"
					aria-label="Close"
					onclick={() => (showInfoLanguages = false)}
				>
					<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
				</button>
			</div>
		{/if}
		<div class="collapse-arrow bg-base-200 collapse mb-4">
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
							<button class="btn btn-ghost text-xs sm:text-sm" onclick={() => addLanguage(code)}
								>{getLanguage(code)}</button
							>
						{/each}
					</div>
				{/if}
			</div>
		</div>
		<div class="tabs tabs-box">
			{#each Object.keys($productStore.languages_codes ?? {}) as code (code)}
				<input
					type="radio"
					name="name_tabs_edit"
					class="tab text-xs sm:text-sm"
					aria-label={getLanguage(code)}
					checked={code === $productStore.lang}
				/>
				<div class="tab-content form-control mb-10 p-6">
					<label class="label text-sm sm:text-base" for={`product-name-edit-${code}`}>
						<span class="flex items-center gap-2">
							{$_('product.edit.name')} ({getLanguage(code)})
							<InfoTooltip text={$_('product.edit.tooltips.product_name')} />
						</span>
					</label>
					<input
						id={`product-name-edit-${code}`}
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
	</div>
</div>
