<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';
	import { preferences } from '$lib/settings';
	import { getPermissionsCtx } from '$lib/stores/user';
	import { PRODUCT_TYPES } from '$lib/const';

	import TagsString from '../../../routes/products/[barcode]/edit/TagsString.svelte';
	import { getLanguageName } from '$lib/languages';
	import InfoTooltip from '../InfoTooltip.svelte';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformationOutline from '@iconify-svelte/mdi/information';
	import { getShortcutCtx } from '$lib/stores/shortcuts';
	import { onMount } from 'svelte';
	import { focusEditField } from '$lib/utils/fieldFocus';

	import InputAutocomplete from '$lib/ui/InputAutocomplete.svelte';
	import IconMdiDelete from '@iconify-svelte/mdi/delete';

	type Props = {
		product: Product;
		categoryNames?: string[];
		labelNames?: string[];
		brandNames?: string[];
		storeNames?: string[];
		countriesNames?: string[];
		editMode?: boolean;
		languages?: string[];
		addLanguage?: (code: string) => void;
		originNames?: string[];
		comment?: string;
	};

	let {
		product = $bindable(),
		categoryNames,
		labelNames,
		brandNames,
		storeNames,
		countriesNames,
		editMode = false,
		languages = [],
		addLanguage,
		originNames,
		comment = $bindable()
	}: Props = $props();

	let showInfo = $state(false);

	const permissions = getPermissionsCtx();

	function toggleInfo() {
		showInfo = !showInfo;
	}

	// Logic for deleting language from LanguagesStep
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

		const newCodes = { ...product.languages_codes };
		delete newCodes[code];
		product.languages_codes = newCodes;

		const fieldsToDelete = [
			`product_name_${code}`,
			`generic_name_${code}`,
			`ingredients_text_${code}`,
			`packaging_text_${code}`
		];
		const clearedFields = Object.fromEntries(fieldsToDelete.map((field) => [field, '']));
		product = { ...product, ...clearedFields };
	}

	// Derived list of language names for InputAutocomplete
	let languageNames = $derived(
		languages.map((code) => {
			return { code: code, en: getLanguageName(code, 'en'), locale: getLanguageName(code) };
		})
	);

	const shortcutCtx = getShortcutCtx();
	onMount(() => {
		shortcutCtx.set('Shift+Q', {
			description: $_('product.shortcuts.edit_product_quantity'),
			action: () => focusEditField('#quantity')
		});
		shortcutCtx.set('Shift+C', {
			description: $_('product.shortcuts.edit_product_categories'),
			action: () => focusEditField('categories-input', true)
		});
		shortcutCtx.set('Shift+B', {
			description: $_('product.shortcuts.edit_product_brands'),
			action: () => focusEditField('brands-input', true)
		});
		shortcutCtx.set('Shift+L', {
			description: $_('product.shortcuts.edit_product_labels'),
			action: () => focusEditField('labels-input', true)
		});

		return () => {
			shortcutCtx.delete('Shift+Q');
			shortcutCtx.delete('Shift+C');
			shortcutCtx.delete('Shift+B');
			shortcutCtx.delete('Shift+L');
		};
	});
</script>

{#if editMode}
	<h2
		class="text-primary mb-6 items-center justify-center gap-2 text-center text-base font-bold md:text-lg lg:text-xl xl:text-2xl"
	>
		<IconMdiInformation class="mr-1 h-6 w-6 align-middle" />
		{$_('product.edit.sections.basic_info', { default: 'Basic Information' })}
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
			<IconMdiInformationOutline class="text-primary mt-0.5 h-6 w-6 flex-shrink-0" />
			<span class="text-base-content/80 p-6 text-sm sm:text-base">
				{$_('product.edit.info.basic_info')}
			</span>
		</div>
	{/if}

	<div class="space-y-6">
		<!-- Product Type (Moderators Only in edit mode) -->
		{#if permissions.isModerator && $preferences.moderator}
			<div class="form-control w-full">
				<label class="label">
					<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
						{$_('product.edit.product_type')}
						<span class="badge badge-info badge-outline badge-xs sm:badge-sm">
							{$_('product.edit.moderator_only')}
						</span>
						<InfoTooltip text={$_('product.edit.tooltips.product_type')} />
					</span>
				</label>
				<div class="flex flex-wrap gap-2">
					{#each PRODUCT_TYPES as type (type)}
						<button
							type="button"
							class="btn btn-sm sm:btn-md flex-1 min-w-[120px] rounded-lg border border-base-300 font-normal transition-all {(product.product_type ??
								'food') === type
								? 'btn-primary border-primary font-semibold shadow-sm'
								: 'bg-base-100 text-base-content/80 hover:bg-base-200 border-base-300'}"
							onclick={() => {
								product = { ...product, product_type: type };
							}}
						>
							{$_(`product.edit.product_types.${type}`)}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Primary Fields Grid -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="form-control w-full sm:col-span-2">
				<div class="label">
					<span class="label-text text-sm font-medium sm:text-base">
						{$_('product.edit.generic_name', { default: 'Common name' })}
					</span>
				</div>
				<div class="space-y-3">
					{#each Object.keys(product.languages_codes ?? {}) as code (code)}
						{@const langName = getLanguageName(code)}
						<div class="flex items-center gap-2">
							<div
								class="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase"
								title={langName}
							>
								{code}
							</div>
							<input
								id={`generic-name-${code}`}
								type="text"
								class="input focus:border-primary w-full text-sm focus:outline-none sm:text-base"
								value={product[`generic_name_${code}`] ?? ''}
								oninput={(e) => {
									product = {
										...product,
										[`generic_name_${code}`]: (e.currentTarget as HTMLInputElement).value
									};
								}}
								placeholder={$_('product.edit.generic_name_placeholder', {
									default: 'e.g., Chocolate chip cookies, Orange juice'
								})}
								aria-label={`${$_('product.edit.generic_name', { default: 'Common name' })} (${langName})`}
							/>
						</div>
					{/each}
				</div>
			</div>
			<div class="form-control w-full sm:col-span-2">
				<label class="label" for="quantity">
					<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
						{$_('product.edit.quantity')}
						<InfoTooltip text={$_('product.edit.tooltips.quantity')} />
					</span>
				</label>
				<input
					id="quantity"
					type="text"
					class="input focus:border-primary w-full text-sm focus:outline-none sm:text-base"
					value={product.quantity ?? ''}
					oninput={(e) => {
						product = { ...product, quantity: (e.currentTarget as HTMLInputElement).value };
					}}
					placeholder="e.g., 250g, 1L, 500ml"
				/>
			</div>

			<div class="form-control w-full sm:col-span-2">
				<label class="label" for="website_url">
					<span class="label-text text-sm font-medium text-wrap sm:text-base">
						{$_('product.edit.product_page_url_add', {
							default: 'Link to the product page on the official site of the producer'
						})}
					</span>
				</label>
				<input
					id="website_url"
					type="url"
					class="input focus:border-primary w-full text-sm break-all focus:outline-none sm:text-base"
					value={product.link ?? ''}
					oninput={(e) => {
						product = { ...product, link: (e.currentTarget as HTMLInputElement).value };
					}}
					placeholder={$_('product.edit.product_page_url_placeholder', {
						default: 'https://example.com/products/pasta-n8'
					})}
				/>
			</div>
		</div>

		<!-- Tags Section -->
		<div class="divider text-sm font-medium opacity-60">
			{$_('product.edit.product_tags', { default: 'Product Tags' })}
		</div>
		<div class="space-y-4">
			<div class="form-control w-full">
				<label class="label" for="categories-input">
					<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
						{$_('product.edit.categories')}
						<InfoTooltip text={$_('product.edit.tooltips.categories')} />
					</span>
				</label>
				<TagsString
					tagsString={product.categories ?? ''}
					autocomplete={categoryNames}
					onChange={(v) => {
						product = { ...product, categories: v };
					}}
				/>
			</div>
			<div class="form-control w-full">
				<label class="label" for="labels-input">
					<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
						{$_('product.edit.labels')}
						<InfoTooltip text={$_('product.edit.tooltips.labels')} />
					</span>
				</label>
				<TagsString
					tagsString={product.labels ?? ''}
					autocomplete={labelNames}
					onChange={(v) => {
						product = { ...product, labels: v };
					}}
				/>
			</div>
			<div class="form-control w-full">
				<label class="label" for="brands-input">
					<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
						{$_('product.edit.brands')}
						<InfoTooltip text={$_('product.edit.tooltips.brand_name')} />
					</span>
				</label>
				<TagsString
					tagsString={product.brands ?? ''}
					autocomplete={brandNames}
					onChange={(v) => {
						product = { ...product, brands: v };
					}}
				/>
			</div>
			<div class="form-control w-full">
				<label class="label" for="stores-input">
					<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
						{$_('product.edit.stores')}
						<InfoTooltip text={$_('product.edit.tooltips.stores')} />
					</span>
				</label>
				<TagsString
					tagsString={product.stores ?? ''}
					autocomplete={storeNames}
					onChange={(v) => {
						product = { ...product, stores: v };
					}}
				/>
			</div>

			<div class="form-control w-full">
				<label class="label" for="countries-input">
					<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
						{$_('product.edit.countries')}
						<InfoTooltip text={$_('product.edit.tooltips.countries')} />
					</span>
				</label>
				<TagsString
					tagsString={product.countries ?? ''}
					autocomplete={countriesNames}
					onChange={(v) => {
						product = { ...product, countries: v };
					}}
				/>
			</div>
		</div>
	</div>
{:else}
	<h2
		class="text-primary mb-6 items-center justify-center gap-2 text-center text-base font-bold md:text-lg lg:text-xl xl:text-2xl"
	>
		<IconMdiInformation class="mr-1 h-6 w-6 align-middle" />
		{$_('product.edit.sections.basic_info', { default: 'Basic Information' })}
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
			<IconMdiInformationOutline class="text-primary mt-0.5 h-6 w-6 flex-shrink-0" />
			<span class="text-base-content/80 p-6 text-sm sm:text-base">
				{$_('product.edit.info.basic_info')}
			</span>
		</div>
	{/if}

	<div class="space-y-6">
		<!-- Product Type (Available for everyone during product addition) -->
		<div class="form-control w-full">
			<label class="label">
				<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
					{$_('product.edit.product_type')}
					<InfoTooltip text={$_('product.edit.tooltips.product_type')} />
				</span>
			</label>
			<div class="flex flex-wrap gap-2">
				{#each PRODUCT_TYPES as type (type)}
					<button
						type="button"
						class="btn btn-sm sm:btn-md flex-1 min-w-[120px] rounded-lg border border-base-300 font-normal transition-all {(product.product_type ??
							'food') === type
							? 'btn-primary border-primary font-semibold shadow-sm'
							: 'bg-base-100 text-base-content/80 hover:bg-base-200 border-base-300'}"
						onclick={() => {
							product = { ...product, product_type: type };
						}}
					>
						{$_(`product.edit.product_types.${type}`)}
					</button>
				{/each}
			</div>
		</div>

		<!-- Main Language selector -->
		<div class="form-control w-full">
			<label class="label" for="main_language_select">
				<span class="label-text text-sm font-medium sm:text-base"
					>{$_('product.edit.main_language')}</span
				>
			</label>
			<select
				id="main_language_select"
				class="select select-bordered focus:border-primary w-full text-sm focus:outline-none sm:text-base"
				value={product.lang}
				onchange={(e) => {
					product = { ...product, lang: (e.currentTarget as HTMLSelectElement).value };
				}}
			>
				{#each Object.keys(product.languages_codes ?? {}) as lang (lang)}
					<option value={lang}>{getLanguageName(lang)}</option>
				{/each}
			</select>
		</div>

		<!-- Product Name (Inputs for all active languages) -->
		<div class="form-control w-full">
			<div class="label">
				<span class="label-text text-sm font-medium sm:text-base">
					{$_('product.edit.product_names', { default: 'Product names' })}
				</span>
			</div>
			{#if Object.keys(product.languages_codes ?? {}).length === 0}
				<div class="alert alert-warning text-sm sm:text-base">
					{$_('product.edit.no_languages_found')}
				</div>
			{/if}
			<div class="space-y-3">
				{#each Object.keys(product.languages_codes ?? {}) as code (code)}
					{@const langName = getLanguageName(code)}
					<div class="flex items-center gap-2">
						<div
							class="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase"
							title={langName}
						>
							{code}
						</div>
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
							placeholder={`${$_('product.edit.name', { default: 'Product name' })} (${langName})`}
							aria-label={`${$_('product.edit.name', { default: 'Product name' })} (${langName})`}
						/>
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
			</div>
			<!-- Collapsible "Add a Language" under product names -->
			<div class="collapse collapse-arrow bg-base-100 mt-3 border border-base-300 rounded-lg">
				<input
					type="checkbox"
					id="add_language_toggle"
					aria-label={$_('product.edit.add_language', { default: 'Add a language' })}
				/>
				<div class="collapse-title text-sm font-semibold sm:text-base py-3 min-h-0">
					{$_('product.edit.add_language')}
				</div>
				<div class="collapse-content">
					<InputAutocomplete
						items={languageNames}
						searchKeys={['code', 'en', 'locale']}
						placeholder={$_('product.edit.search_languages')}
						inline
						onselect={(lang) => {
							if (addLanguage) addLanguage(lang.code);
						}}
					/>
				</div>
			</div>
		</div>

		<!-- Brands -->
		<div class="form-control w-full">
			<label class="label" for="brands-input">
				<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
					{$_('product.edit.brands')}
					<InfoTooltip text={$_('product.edit.tooltips.brand_name')} />
				</span>
			</label>
			<TagsString
				tagsString={product.brands ?? ''}
				autocomplete={brandNames}
				onChange={(v) => {
					product = { ...product, brands: v };
				}}
			/>
		</div>

		<!-- Collapsible "More details" section -->
		<div class="collapse collapse-arrow bg-base-200 border border-base-300 rounded-lg">
			<input
				type="checkbox"
				id="more_details_toggle"
				aria-label={$_('product.edit.more_details', { default: 'More details' })}
			/>
			<div class="collapse-title text-sm font-bold sm:text-base">
				{$_('product.edit.more_details', { default: 'More details' })}
			</div>
			<div class="collapse-content bg-base-100">
				<div class="pt-5 space-y-6">
					<!-- A. Product Details -->
					<div class="divider divider-start text-base font-bold opacity-80 sm:text-lg">
						{$_('product.edit.more_details_subsections.product_details', {
							default: 'Product Details'
						})}
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="form-control w-full sm:col-span-2">
							<div class="label">
								<span class="label-text text-sm font-medium sm:text-base">
									{$_('product.edit.generic_name', { default: 'Common name' })}
								</span>
							</div>
							<div class="space-y-3">
								{#each Object.keys(product.languages_codes ?? {}) as code (code)}
									{@const langName = getLanguageName(code)}
									<div class="flex items-center gap-2">
										<div
											class="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase"
											title={langName}
										>
											{code}
										</div>
										<input
											id={`generic-name-${code}`}
											type="text"
											class="input input-bordered focus:border-primary w-full text-sm focus:outline-none sm:text-base"
											value={product[`generic_name_${code}`] ?? ''}
											oninput={(e) => {
												product = {
													...product,
													[`generic_name_${code}`]: (e.currentTarget as HTMLInputElement).value
												};
											}}
											placeholder={$_('product.edit.generic_name_placeholder', {
												default: 'e.g., Chocolate chip cookies, Orange juice'
											})}
											aria-label={`${$_('product.edit.generic_name', { default: 'Common name' })} (${langName})`}
										/>
									</div>
								{/each}
							</div>
						</div>
						<div class="form-control w-full sm:col-span-2">
							<label class="label" for="quantity">
								<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
									{$_('product.edit.quantity')}
									<InfoTooltip text={$_('product.edit.tooltips.quantity')} />
								</span>
							</label>
							<input
								id="quantity"
								type="text"
								class="input input-bordered focus:border-primary w-full text-sm focus:outline-none sm:text-base"
								value={product.quantity ?? ''}
								oninput={(e) => {
									product = { ...product, quantity: (e.currentTarget as HTMLInputElement).value };
								}}
								placeholder="e.g., 250g, 1L, 500ml"
							/>
						</div>
						<div class="form-control w-full sm:col-span-2">
							<label class="label" for="website_url">
								<span class="label-text text-sm font-medium text-wrap sm:text-base">
									{$_('product.edit.product_page_url_add', {
										default: 'Link to the product page on the official site of the producer'
									})}
								</span>
							</label>
							<input
								id="website_url"
								type="url"
								class="input input-bordered focus:border-primary w-full text-sm break-all focus:outline-none sm:text-base"
								value={product.link ?? ''}
								oninput={(e) => {
									product = { ...product, link: (e.currentTarget as HTMLInputElement).value };
								}}
								placeholder={$_('product.edit.product_page_url_placeholder', {
									default: 'https://example.com/products/pasta-n8'
								})}
							/>
						</div>
					</div>

					<!-- B. Classification -->
					<div class="divider divider-start text-base font-bold opacity-80 sm:text-lg">
						{$_('product.edit.more_details_subsections.classification', {
							default: 'Classification'
						})}
					</div>
					<div class="space-y-4">
						<div class="form-control w-full">
							<label class="label" for="categories-input">
								<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
									{$_('product.edit.categories')}
									<InfoTooltip text={$_('product.edit.tooltips.categories')} />
								</span>
							</label>
							<TagsString
								tagsString={product.categories ?? ''}
								autocomplete={categoryNames}
								onChange={(v) => {
									product = { ...product, categories: v };
								}}
							/>
						</div>
						<div class="form-control w-full">
							<label class="label" for="labels-input">
								<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
									{$_('product.edit.labels')}
									<InfoTooltip text={$_('product.edit.tooltips.labels')} />
								</span>
							</label>
							<TagsString
								tagsString={product.labels ?? ''}
								autocomplete={labelNames}
								onChange={(v) => {
									product = { ...product, labels: v };
								}}
							/>
						</div>
						<div class="form-control w-full">
							<label class="label" for="stores-input">
								<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
									{$_('product.edit.stores')}
									<InfoTooltip text={$_('product.edit.tooltips.stores')} />
								</span>
							</label>
							<TagsString
								tagsString={product.stores ?? ''}
								autocomplete={storeNames}
								onChange={(v) => {
									product = { ...product, stores: v };
								}}
							/>
						</div>
						<div class="form-control w-full">
							<label class="label" for="countries-input">
								<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
									{$_('product.edit.countries')}
									<InfoTooltip text={$_('product.edit.tooltips.countries')} />
								</span>
							</label>
							<TagsString
								tagsString={product.countries ?? ''}
								autocomplete={countriesNames}
								onChange={(v) => {
									product = { ...product, countries: v };
								}}
							/>
						</div>
					</div>

					<!-- C. Origin & Traceability -->
					<div class="divider divider-start text-base font-bold opacity-80 sm:text-lg">
						{$_('product.edit.more_details_subsections.origin_traceability', {
							default: 'Origin & Traceability'
						})}
					</div>
					<div class="space-y-4">
						<div class="form-control w-full">
							<label class="label" for="manufacturing_places">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.manufacturing_places')}</span
								>
							</label>
							<input
								id="manufacturing_places"
								type="text"
								class="input input-bordered focus:border-primary w-full text-sm focus:outline-none sm:text-base"
								value={product.manufacturing_places ?? ''}
								oninput={(e) => {
									product = {
										...product,
										manufacturing_places: (e.currentTarget as HTMLInputElement).value
									};
								}}
								placeholder="e.g., France, Italy"
							/>
						</div>
						<div class="form-control w-full">
							<label class="label" for="origins-input">
								<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
									{$_('product.edit.origins')}
									<InfoTooltip text={$_('product.edit.tooltips.origins')} />
								</span>
							</label>
							<TagsString
								tagsString={product.origins ?? ''}
								autocomplete={originNames}
								onChange={(v) => {
									product = { ...product, origins: v };
								}}
							/>
						</div>
						<div class="form-control w-full">
							<label class="label" for="traceability-codes">
								<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
									{$_('product.edit.emb_code')}
									<InfoTooltip text={$_('product.edit.tooltips.traceability_code')} />
								</span>
							</label>
							<TagsString
								tagsString={product.emb_codes ?? ''}
								autocomplete={[]}
								onChange={(v) => {
									product = { ...product, emb_codes: v };
								}}
							/>
							<div class="mt-1 text-xs text-base-content/60">
								<p>Examples: FR 38.012.001 CE, ES 12.03456/B CE, IT 1234 L CE</p>
							</div>
						</div>
					</div>

					<!-- E. Comment -->
					<div class="divider divider-start text-base font-bold opacity-80 sm:text-lg">
						{$_('product.edit.more_details_subsections.comment', { default: 'Comment' })}
					</div>
					<div class="form-control w-full">
						<textarea
							id="comment"
							class="textarea textarea-bordered w-full text-sm sm:text-base"
							placeholder={$_('product.edit.comment_placeholder')}
							bind:value={comment}
							rows="3"></textarea>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
