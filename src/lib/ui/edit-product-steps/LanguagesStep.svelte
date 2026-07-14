<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';
	import { getLanguageName } from '$lib/languages';

	import IconMdiTranslate from '@iconify-svelte/mdi/translate';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiDelete from '@iconify-svelte/mdi/delete';
	import IconMdiAlert from '@iconify-svelte/mdi/alert';
	import { getShortcutCtx } from '$lib/stores/shortcuts';
	import { onMount } from 'svelte';
	import { focusEditField } from '$lib/utils/fieldFocus';
	import InputAutocomplete from '$lib/ui/InputAutocomplete.svelte';

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
		const newCodes = { ...product.languages_codes };
		delete newCodes[code];
		product.languages_codes = newCodes;

		// Set all fields of the language to empty string
		const fieldsToDelete = [
			`product_name_${code}`,
			`ingredients_text_${code}`,
			`packaging_text_${code}`
		];
		const clearedFields = Object.fromEntries(fieldsToDelete.map((field) => [field, '']));
		product = { ...product, ...clearedFields };
	}

	let showInfo = $state(false);
	function toggleInfo() {
		showInfo = !showInfo;
	}

	let shortcutCtx = getShortcutCtx();
	onMount(() => {
		shortcutCtx.set('Shift+P', {
			description: $_('product.shortcuts.edit_product_name'),
			action: () => focusEditField(`#product-name-${product.lang}`)
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
	<span class="label">The main language of the product</span>
</fieldset>

<div class="mt-4 space-y-4">
	<fieldset class="fieldset">
		<legend class="fieldset-legend">
			{$_('product.edit.product_names', { default: 'Product names' })}
		</legend>

		{#if Object.keys(product.languages_codes ?? {}).length === 0}
			<div class="alert alert-warning text-sm sm:text-base">
				{$_('product.edit.no_languages_found')}
			</div>
		{/if}

		{#each Object.keys(product.languages_codes ?? {}) as code (code)}
			{@const langName = getLanguageName(code)}
			<div class="flex items-center gap-2">
				<div
					class="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase"
					title={langName}
				>
					{code}
				</div>
				<div class="w-full">
					<input
						id={`product-name-${code}`}
						type="text"
						class="input input-bordered w-full text-sm sm:text-base transition-all {!product[
							`product_name_${code}`
						]
							? 'border-dashed border-warning/50 bg-warning/5'
							: ''}"
						value={product[`product_name_${code}`] ?? ''}
						oninput={(e) => {
							product = {
								...product,
								[`product_name_${code}`]: (e.currentTarget as HTMLInputElement).value
							};
						}}
						aria-label={`${$_('product.edit.name')} (${langName})`}
					/>
					{#if !product[`product_name_${code}`]}
						<span class="text-xs text-warning/70 mt-1 font-medium flex items-center gap-1">
							<IconMdiAlert class="h-3.5 w-3.5 shrink-0" />
							{$_('product.edit.missing_info', { default: 'Missing info' })}
						</span>
					{/if}
				</div>
				{#if code !== product.lang}
					<button
						type="button"
						class="btn btn-ghost btn-xs text-error h-auto min-h-0 p-1 hover:bg-base-300 shrink-0"
						onclick={() => deleteLanguage(code)}
						title={$_('product.edit.delete_language', { default: 'Delete language' })}
						aria-label={$_('product.edit.delete_language', { default: 'Delete language' })}
					>
						<IconMdiDelete class="h-5 w-5" />
					</button>
				{:else}
					<div
						title={$_('product.edit.cannot_delete_main_language', {
							default: 'Cannot delete the main language'
						})}
						class="shrink-0 flex items-center justify-center"
					>
						<button
							type="button"
							class="btn btn-ghost btn-xs text-base-content/30 btn-disabled h-auto min-h-0 p-1 pointer-events-none"
							disabled
							aria-label={$_('product.edit.cannot_delete_main_language', {
								default: 'Cannot delete the main language'
							})}
						>
							<IconMdiDelete class="h-5 w-5" />
						</button>
					</div>
				{/if}
			</div>
		{/each}

		<div class="label block whitespace-normal">{$_('product.edit.tooltips.product_name')}</div>
	</fieldset>
</div>

<div
	class="collapse-arrow bg-base-300 dark:bg-base-200 collapse mt-4 border-2 rounded-lg border-base-300"
>
	<input type="checkbox" />
	<div class="collapse-title text-sm font-semibold sm:text-base">
		{$_('product.edit.add_language')}
	</div>
	<div class="collapse-content">
		<InputAutocomplete
			items={languageNames}
			searchKeys={['code', 'en', 'locale']}
			placeholder={$_('product.edit.search_languages')}
			inline
			onselect={(lang) => {
				addLanguage(lang.code);
			}}
		/>
	</div>
</div>
