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

	type Props = {
		product: Product;
		categoryNames?: string[];
		labelNames?: string[];
		brandNames?: string[];
		storeNames?: string[];
		countriesNames?: string[];
		editMode?: boolean;
	};

	let {
		product = $bindable(),
		categoryNames,
		labelNames,
		brandNames,
		storeNames,
		countriesNames,
		editMode = false
	}: Props = $props();

	let showInfo = $state(false);

	const permissions = getPermissionsCtx();

	function toggleInfo() {
		showInfo = !showInfo;
	}

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

{#if !editMode}
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
{/if}
<div class="space-y-6">
	<!-- Product Type (Moderators Only) -->
	{#if permissions.isModerator && $preferences.moderator}
		<div class="form-control w-full sm:w-1/2">
			<label class="label" for="product_type">
				<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
					{$_('product.edit.product_type')}
					<span class="badge badge-info badge-outline badge-xs sm:badge-sm">
						{$_('product.edit.moderator_only')}
					</span>
					<InfoTooltip text={$_('product.edit.tooltips.product_type')} />
				</span>
			</label>
			<select
				id="product_type"
				class="select focus:border-primary w-full text-sm focus:outline-none sm:text-base"
				value={product.product_type}
				onchange={(e) => {
					product = { ...product, product_type: (e.currentTarget as HTMLSelectElement).value };
				}}
			>
				{#each PRODUCT_TYPES as type (type)}
					<option value={type}>{$_(`product.edit.product_types.${type}`)}</option>
				{/each}
			</select>
		</div>
	{/if}

	<!-- Primary Fields Grid -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<div class="form-control w-full">
			<label class="label" for="generic_name">
				<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
					{$_('product.edit.generic_name', { default: 'Common name' })} ({getLanguageName(
						product.lang
					)})
				</span>
			</label>
			<input
				id="generic_name"
				type="text"
				class="input focus:border-primary w-full text-sm focus:outline-none sm:text-base"
				value={product[`generic_name_${product.lang}`] ?? ''}
				oninput={(e) => {
					product = {
						...product,
						[`generic_name_${product.lang}`]: (e.currentTarget as HTMLInputElement).value
					};
				}}
				placeholder={$_('product.edit.generic_name_placeholder', {
					default: 'e.g., Chocolate chip cookies, Orange juice'
				})}
			/>
		</div>
		<div class="form-control w-full">
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
