<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';

	import TagsString from '../../../routes/products/[barcode]/edit/TagsString.svelte';
	import TraceabilityCodes from '../../../routes/products/[barcode]/edit/TraceabilityCodes.svelte';
	import InfoTooltip from '../InfoTooltip.svelte';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformationOutline from '@iconify-svelte/mdi/information';

	type Props = {
		product: Product;
		categoryNames?: string[];
		labelNames?: string[];
		brandNames?: string[];
		storeNames?: string[];
		originNames?: string[];
		countriesNames?: string[];
	};

	let {
		product = $bindable(),
		categoryNames,
		labelNames,
		brandNames,
		storeNames,
		originNames,
		countriesNames
	}: Props = $props();

	let showInfo = $state(false);
	function toggleInfo() {
		showInfo = !showInfo;
	}
</script>

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
	<!-- Primary Fields Grid -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
				bind:value={product.quantity}
				placeholder="e.g., 250g, 1L, 500ml"
			/>
		</div>
		<div class="form-control w-full">
			<label class="label" for="manufacturing_places">
				<span class="label-text text-sm font-medium sm:text-base"
					>{$_('product.edit.manufacturing_places')}</span
				>
			</label>
			<input
				id="manufacturing_places"
				type="text"
				class="input focus:border-primary w-full text-sm focus:outline-none sm:text-base"
				bind:value={product.manufacturing_places}
				placeholder="e.g., France, Italy"
			/>
		</div>
	</div>
	<div class="form-control w-full">
		<label class="label" for="website_url">
			<span class="label-text text-sm font-medium text-wrap sm:text-base">
				{$_('product.edit.product_page_url')}
			</span>
		</label>
		<input
			id="website_url"
			type="url"
			class="input focus:border-primary w-full text-sm text-wrap focus:outline-none sm:text-base"
			bind:value={product.link}
			placeholder="https://example.com/products/pasta-n8"
		/>
	</div>
	<!-- Tags Section -->
	<div class="divider text-sm font-medium opacity-60">{$_('product.edit.product_tags')}</div>
	<div class="space-y-4">
		<div class="form-control w-full">
			<label class="label" for="categories-input">
				<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
					{$_('product.edit.categories')}
					<InfoTooltip text={$_('product.edit.tooltips.categories')} />
				</span>
			</label>
			<TagsString bind:tagsString={product.categories} autocomplete={categoryNames} />
		</div>
		<div class="form-control w-full">
			<label class="label" for="labels-input">
				<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
					{$_('product.edit.labels')}
					<InfoTooltip text={$_('product.edit.tooltips.labels')} />
				</span>
			</label>
			<TagsString bind:tagsString={product.labels} autocomplete={labelNames} />
		</div>
		<div class="form-control w-full">
			<label class="label" for="brands-input">
				<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
					{$_('product.edit.brands')}
					<InfoTooltip text={$_('product.edit.tooltips.brand_name')} />
				</span>
			</label>
			<TagsString bind:tagsString={product.brands} autocomplete={brandNames} />
		</div>
		<div class="form-control w-full">
			<label class="label" for="stores-input">
				<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
					{$_('product.edit.stores')}
					<InfoTooltip text={$_('product.edit.tooltips.stores')} />
				</span>
			</label>
			<TagsString bind:tagsString={product.stores} autocomplete={storeNames} />
		</div>
		<div class="form-control w-full">
			<label class="label" for="origins-input">
				<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
					{$_('product.edit.origins')}
					<InfoTooltip text={$_('product.edit.tooltips.origins')} />
				</span>
			</label>
			<TagsString bind:tagsString={product.origins} autocomplete={originNames} />
		</div>
		<div class="form-control w-full">
			<label class="label" for="countries-input">
				<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
					{$_('product.edit.countries')}
					<InfoTooltip text={$_('product.edit.tooltips.countries')} />
				</span>
			</label>
			<TagsString bind:tagsString={product.countries} autocomplete={countriesNames} />
		</div>
		<div class="form-control w-full">
			<label class="label" for="traceability-codes-input">
				<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
					Traceability Codes
					<InfoTooltip text={$_('product.edit.tooltips.traceability_code')} />
				</span>
			</label>
			<TraceabilityCodes bind:traceabilityCodes={product.emb_codes} autocomplete={[]} />
		</div>
	</div>
</div>
