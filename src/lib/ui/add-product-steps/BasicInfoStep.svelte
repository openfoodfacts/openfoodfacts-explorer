<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';

	import TagsString from '../../../routes/products/[barcode]/edit/TagsString.svelte';
	import TraceabilityCodes from '../../../routes/products/[barcode]/edit/TraceabilityCodes.svelte';
	import InfoTooltip from '../InfoTooltip.svelte';

	type Props = {
		productStore: Writable<Product>;
		categoryNames: string[];
		labelNames: string[];
		brandNames: string[];
		storeNames: string[];
		originNames: string[];
		countriesNames: string[];
	};

	let showInfo = $state(false);

	let {
		productStore,
		categoryNames,
		labelNames,
		brandNames,
		storeNames,
		originNames,
		countriesNames
	}: Props = $props();

	function onToggleInfo() {
		showInfo = !showInfo;
	}
</script>

<div class="card bg-base-100 shadow-md">
	<div class="card-body p-4 sm:p-6">
		<h2
			class="text-primary mb-6 items-center justify-center gap-2 text-center text-base font-bold md:text-lg lg:text-xl xl:text-2xl"
		>
			<span class="icon-[mdi--information] mr-1 h-6 w-6 align-middle"></span>
			{$_('product.edit.sections.basic_info')}
			<button type="button" class="ml-2 align-middle" aria-label="Info" onclick={onToggleInfo}>
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
					onclick={onToggleInfo}
				>
					<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
				</button>
				<span class="icon-[mdi--information] text-primary mt-0.5 h-6 w-6 flex-shrink-0"></span>
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
						bind:value={$productStore.quantity}
						placeholder="e.g., 250g, 1L, 500ml"
					/>
				</div>
				<div class="form-control w-full">
					<label class="label" for="packaging">
						<span class="label-text text-sm font-medium sm:text-base"
							>{$_('product.edit.packaging')}</span
						>
					</label>
					<input
						id="packaging"
						type="text"
						class="input focus:border-primary w-full text-sm focus:outline-none sm:text-base"
						bind:value={$productStore.packaging}
						placeholder="e.g., plastic bottle, glass jar"
					/>
				</div>
			</div>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
						bind:value={$productStore.manufacturing_places}
						placeholder="e.g., France, Italy"
					/>
				</div>
				<div class="form-control w-full">
					<label class="label" for="emb_codes">
						<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
							{$_('product.edit.emb_code')}
							<InfoTooltip text={$_('product.edit.tooltips.traceability_code')} />
						</span>
					</label>
					<input
						id="emb_codes"
						type="text"
						class="input focus:border-primary w-full text-sm focus:outline-none sm:text-base"
						bind:value={$productStore.emb_codes}
						placeholder="e.g., EMB 12345"
					/>
				</div>
			</div>
			<div class="form-control w-full">
				<label class="label" for="website_url">
					<span class="label-text text-sm font-medium text-wrap sm:text-base"
						>{$_('product.edit.product_page_url')}</span
					>
				</label>
				<input
					id="website_url"
					type="url"
					class="input focus:border-primary w-full text-sm text-wrap focus:outline-none sm:text-base"
					bind:value={$productStore.link}
					placeholder="https://example.com"
				/>
			</div>
			<!-- Tags Section -->
			<div class="divider text-sm font-medium opacity-60">Product Tags</div>
			<div class="space-y-4">
				<div class="form-control w-full">
					<label class="label" for="categories-input">
						<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
							{$_('product.edit.categories')}
							<InfoTooltip text={$_('product.edit.tooltips.categories')} />
						</span>
					</label>
					<TagsString bind:tagsString={$productStore.categories} autocomplete={categoryNames} />
				</div>
				<div class="form-control w-full">
					<label class="label" for="labels-input">
						<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
							{$_('product.edit.labels')}
							<InfoTooltip text={$_('product.edit.tooltips.labels')} />
						</span>
					</label>
					<TagsString bind:tagsString={$productStore.labels} autocomplete={labelNames} />
				</div>
				<div class="form-control w-full">
					<label class="label" for="brands-input">
						<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
							{$_('product.edit.brands')}
							<InfoTooltip text={$_('product.edit.tooltips.brand_name')} />
						</span>
					</label>
					<TagsString bind:tagsString={$productStore.brands} autocomplete={brandNames} />
				</div>
				<div class="form-control w-full">
					<label class="label" for="stores-input">
						<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
							{$_('product.edit.stores')}
							<InfoTooltip text={$_('product.edit.tooltips.stores')} />
						</span>
					</label>
					<TagsString bind:tagsString={$productStore.stores} autocomplete={storeNames} />
				</div>
				<div class="form-control w-full">
					<label class="label" for="origins-input">
						<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
							{$_('product.edit.origins')}
							<InfoTooltip text={$_('product.edit.tooltips.origins')} />
						</span>
					</label>
					<TagsString bind:tagsString={$productStore.origins} autocomplete={originNames} />
				</div>
				<div class="form-control w-full">
					<label class="label" for="countries-input">
						<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
							{$_('product.edit.countries')}
							<InfoTooltip text={$_('product.edit.tooltips.countries')} />
						</span>
					</label>
					<TagsString bind:tagsString={$productStore.countries} autocomplete={countriesNames} />
				</div>
				<div class="form-control w-full">
					<label class="label" for="traceability-codes-input">
						<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
							Traceability Codes
							<InfoTooltip text={$_('product.edit.tooltips.traceability_code')} />
						</span>
					</label>
					<TraceabilityCodes bind:traceabilityCodes={$productStore.emb_codes} autocomplete={[]} />
				</div>
			</div>
		</div>
	</div>
</div>
