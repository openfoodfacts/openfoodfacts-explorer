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
	import { getShortcutCtx } from '$lib/stores/shortcuts';
	import { onMount } from 'svelte';
	import { focusEditField } from '$lib/utils/fieldFocus';
	import InputAutocomplete from '../InputAutocomplete.svelte';

	type Props = {
		product: Product;
		codes: string[];
		editMode?: boolean;

		addLanguage: (code: string) => void;
	};

	let { product = $bindable(), codes, addLanguage, editMode = false }: Props = $props();

	let languageNames = $derived(
		codes.map((code) => {
			return { code: code, en: getLanguageName(code, 'en'), locale: getLanguageName(code) };
		})
	);

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

		// Copy the product object at the start of the editing phase
		const newProd = { ...product };

		// Remove the language from product.languages_codes
		const codes = { ...newProd.languages_codes };
		delete codes[code];
		newProd.languages_codes = codes;

		// Remove all fields of the language from product object
		const fieldsToDelete = [
			`product_name_${code}`,
			`ingredients_text_${code}`,
			`packaging_text_${code}`
		];
		for (const field of fieldsToDelete) {
			if (field in newProd) {
				delete newProd[field as keyof Product];
			}
		}

		// Reassign back to trigger Svelte reactivity once
		product = newProd;

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

{#if !editMode}
	<h2
		class="text-primary mb-6 items-center justify-center gap-2 text-center text-base font-bold md:text-lg lg:text-xl xl:text-2xl"
	>
		<IconMdiTranslate class="mr-1 h-6 w-6 align-middle" />
		{$_('product.edit.sections.languages')}
		<button
			type="button"
			class="ml-2 align-middle"
			aria-label={$_('common.info', { default: 'Info' })}
			onclick={toggleInfo}
		>
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
				aria-label={$_('common.close', { default: 'Close' })}
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
{/if}

<fieldset class="fieldset">
	<legend class="fieldset-legend">{$_('product.edit.main_language')}</legend>
	<select
		class="select w-full"
		value={product.lang}
		onchange={(e) => {
			product = { ...product, lang: (e.currentTarget as HTMLSelectElement).value };
		}}
	>
		{#each Object.keys(product.languages_codes ?? {}) as lang (lang)}
			<option value={lang}>{getLanguageName(lang)}</option>
		{/each}
	</select>
	<span class="label"
		>{$_('product.edit.main_language_description', {
			default: 'The main language of the product'
		})}</span
	>
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

	<InputAutocomplete
		items={languageNames}
		searchKeys={['code', 'en', 'locale']}
		placeholder={$_('product.edit.add_language', { default: 'Add a language...' })}
		buttonTitle={$_('product.edit.add_language', { default: 'Add a language' })}
		buttonAriaLabel={$_('product.edit.add_language', { default: 'Add a language' })}
		onselect={(lang) => {
			addLanguage(lang.code);
			activeLang = lang.code;
		}}
	/>

	<!-- Tab Panel Content -->
	{#each Object.keys(product.languages_codes ?? {}) as code (code)}
		{#if code === activeLang}
			{@const langName = getLanguageName(code)}
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
					value={product[`product_name_${code}`] ?? ''}
					oninput={(e) => {
						product = {
							...product,
							[`product_name_${code}`]: (e.currentTarget as HTMLInputElement).value
						};
					}}
					aria-label={`${$_('product.edit.name')} (${langName})`}
				/>
			</div>
		{/if}
	{/each}
</div>
