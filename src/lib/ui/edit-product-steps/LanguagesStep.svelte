<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';
	import { getLanguageName } from '$lib/languages';

	import InfoTooltip from '../InfoTooltip.svelte';

	import IconMdiTranslate from '@iconify-svelte/mdi/translate';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiDelete from '@iconify-svelte/mdi/delete';
	import IconMdiPlus from '@iconify-svelte/mdi/plus';
	import { getShortcutCtx } from '$lib/stores/shortcuts';
	import { onMount } from 'svelte';
	import { focusEditField } from '$lib/utils/fieldFocus';

	type Props = {
		product: Product;
		codes: string[];

		addLanguage: (code: string) => void;
	};

	let { product = $bindable(), codes, addLanguage }: Props = $props();

	let languageNames = $derived(
		codes.map((code) => {
			return { code: code, en: getLanguageName(code, 'en'), locale: getLanguageName(code) };
		})
	);

	// Local state for language search input
	let languageSearch = $state('');
	let autoCompleteIndex = $state(-1);
	let showAddInput = $state(false);

	let filteredLanguages = $derived(
		languageSearch.length === 0
			? []
			: languageNames
					.filter((code) =>
						[code.code, code.en, code.locale].some((name) =>
							name.toLowerCase().includes(languageSearch.toLowerCase())
						)
					)
					.slice(0, 10)
	);

	$effect(() => {
		// Reset autocomplete index whenever search term changes
		const _ = languageSearch;
		autoCompleteIndex = -1;
	});

	function focusInput(element: HTMLInputElement) {
		element.focus();
	}

	function inputHandler(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			let selected = null;
			if (autoCompleteIndex !== -1 && filteredLanguages[autoCompleteIndex]) {
				selected = filteredLanguages[autoCompleteIndex];
			} else if (filteredLanguages.length > 0) {
				selected = filteredLanguages[0];
			}

			if (selected) {
				addLanguage(selected.code);
				activeLang = selected.code;
				languageSearch = '';
				autoCompleteIndex = -1;
				showAddInput = false;
			}
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (autoCompleteIndex === -1) {
				autoCompleteIndex = 0;
			} else if (autoCompleteIndex < filteredLanguages.length - 1) {
				autoCompleteIndex += 1;
			}
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (autoCompleteIndex === -1) {
				autoCompleteIndex = filteredLanguages.length - 1;
			} else if (autoCompleteIndex > 0) {
				autoCompleteIndex -= 1;
			}
		} else if (event.key === 'Escape') {
			languageSearch = '';
			autoCompleteIndex = -1;
			showAddInput = false;
		}
	}

	let showInfo = $state(false);
	function toggleInfo() {
		showInfo = !showInfo;
	}

	let activeLang = $state(product.lang);
	let shortcutCtx = getShortcutCtx();

	function deleteLanguage(code: string) {
		if (code === product.lang) {
			alert(
				$_('product.edit.cannot_delete_main_language', {
					default: 'Cannot delete the main language'
				})
			);
			return;
		}

		const confirmed = confirm(
			$_('product.edit.confirm_delete_language', {
				default: 'Are you sure you want to delete all fields for {language}?',
				values: { language: getLanguageName(code) }
			})
		);
		if (!confirmed) return;

		// Remove the language from product.languages_codes
		const codes = { ...product.languages_codes };
		delete codes[code];
		product.languages_codes = codes;

		// Remove all fields of the language from product object
		const fieldsToDelete = [
			`product_name_${code}`,
			`ingredients_text_${code}`,
			`packaging_text_${code}`
		];
		for (const field of fieldsToDelete) {
			if (field in product) {
				delete product[field as keyof Product];
			}
		}
		// Trigger Svelte reactivity on product
		product = { ...product };

		// Switch to main language if the active language was the deleted one
		if (activeLang === code) {
			activeLang = product.lang;
		}
	}

	onMount(() => {
		shortcutCtx.set('Shift+P', {
			description: $_('product.shortcuts.edit_product_name'),
			action: () => focusEditField(`#product-name-${activeLang}`)
		});

		return () => {
			shortcutCtx.delete('Shift+P');
		};
	});
</script>

<h2
	class="text-primary mb-6 items-center justify-center gap-2 text-center text-base font-bold md:text-lg lg:text-xl xl:text-2xl"
>
	<IconMdiTranslate class="mr-1 h-6 w-6 align-middle" />
	{$_('product.edit.sections.languages')}
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
			{$_('product.edit.info.languages')}
		</span>
	</div>
{/if}

<fieldset class="fieldset">
	<legend class="fieldset-legend">{$_('product.edit.main_language')}</legend>
	<select class="select w-full" bind:value={product.lang}>
		{#each Object.keys(product.languages_codes ?? {}) as lang (lang)}
			<option value={lang}>{getLanguageName(lang)}</option>
		{/each}
	</select>
	<span class="label">The main language of the product</span>
</fieldset>

<div class="divider"></div>

<div role="tablist" class="tabs tabs-box mt-4 flex flex-wrap items-center">
	{#if Object.keys(product.languages_codes ?? {}).length === 0}
		<div class="alert alert-warning w-full text-sm sm:text-base">
			{$_('product.edit.no_languages_found')}
		</div>
	{:else}
		{#each Object.keys(product.languages_codes ?? {}) as code (code)}
			<div
				role="tab"
				class="tab flex items-center gap-2 text-xs sm:text-sm {code === activeLang
					? 'tab-active'
					: ''}"
				onclick={() => (activeLang = code)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') activeLang = code;
				}}
				tabindex="0"
			>
				<span>{getLanguageName(code)}</span>
				{#if code !== product.lang && code === activeLang}
					<button
						type="button"
						class="btn btn-ghost btn-xs text-error h-auto min-h-0 p-0.5 hover:bg-base-300"
						onclick={(e) => {
							e.stopPropagation();
							deleteLanguage(code);
						}}
						title={$_('product.edit.delete_language', { default: 'Delete language' })}
						aria-label={$_('product.edit.delete_language', { default: 'Delete language' })}
					>
						<IconMdiDelete class="h-4 w-4" />
					</button>
				{/if}
			</div>
		{/each}
	{/if}

	{#if !showAddInput}
		<button
			type="button"
			class="btn btn-primary btn-sm btn-circle ml-2"
			onclick={() => (showAddInput = true)}
			title={$_('product.edit.add_language', { default: 'Add a language' })}
			aria-label={$_('product.edit.add_language', { default: 'Add a language' })}
		>
			<IconMdiPlus class="h-5 w-5" />
		</button>
	{:else}
		<!-- Inline Autocomplete Input for Adding Language -->
		<div class="dropdown relative ml-2 grow max-w-xs">
			<label class="input input-sm flex items-center gap-2 w-full">
				<IconMdiPlus class="h-4 w-4 opacity-70" />
				<input
					type="text"
					placeholder={$_('product.edit.add_language', { default: 'Add a language...' })}
					bind:value={languageSearch}
					onkeydown={inputHandler}
					onblur={() => {
						// Delay to allow dropdown selection clicks to process
						setTimeout(() => {
							showAddInput = false;
							languageSearch = '';
						}, 200);
					}}
					use:focusInput
					class="grow text-xs sm:text-sm"
				/>
			</label>
			{#if languageSearch.length > 0 && filteredLanguages.length > 0}
				<div
					class="dropdown-content bg-base-200 z-10 mt-1 w-full rounded-md shadow-lg border border-base-300 focus:outline-none"
				>
					<ul class="divide-base-100 divide-y max-h-60 overflow-y-auto">
						{#each filteredLanguages as lang, idx (lang.code)}
							<li>
								<button
									type="button"
									class="bg-base-100 text-base-content hover:bg-primary hover:text-primary-content focus:bg-primary focus:text-primary-content w-full px-4 py-2 text-left text-xs sm:text-sm transition-colors duration-150"
									class:bg-primary={autoCompleteIndex === idx}
									class:text-primary-content={autoCompleteIndex === idx}
									onclick={(e) => {
										e.preventDefault();
										addLanguage(lang.code);
										activeLang = lang.code;
										languageSearch = '';
										autoCompleteIndex = -1;
										showAddInput = false;
									}}
								>
									<span>{lang.locale} ({lang.en})</span>
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Tab Panel Content -->
	{#if Object.keys(product.languages_codes ?? {}).length > 0}
		{#each Object.keys(product.languages_codes ?? {}) as code (code)}
			{#if code === activeLang}
				<div class="form-control p-6 w-full">
					<label class="label text-sm sm:text-base" for={`product-name-${code}`}>
						<span class="flex items-center gap-2">
							{$_('product.edit.name')} ({getLanguageName(code)})
							<InfoTooltip text={$_('product.edit.tooltips.product_name')} />
						</span>
					</label>
					<input
						id={`product-name-${code}`}
						type="text"
						class="input input-bordered w-full text-sm sm:text-base"
						bind:value={product[`product_name_${code}`]}
					/>
				</div>
			{/if}
		{/each}
	{/if}
</div>
