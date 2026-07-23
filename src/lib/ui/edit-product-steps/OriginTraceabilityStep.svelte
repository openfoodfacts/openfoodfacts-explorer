<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';

	import TagsString from '../../../routes/products/[barcode]/edit/TagsString.svelte';
	import InfoTooltip from '../InfoTooltip.svelte';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformationOutline from '@iconify-svelte/mdi/information';

	type Props = {
		product: Product;
		originNames?: string[];
		editMode?: boolean;
	};

	let { product = $bindable(), originNames, editMode = false }: Props = $props();

	let showInfo = $state(false);

	function toggleInfo() {
		showInfo = !showInfo;
	}
</script>

{#if !editMode}
	<h2
		class="mb-6 items-center justify-center gap-2 text-center text-base font-bold text-primary md:text-lg lg:text-xl xl:text-2xl"
	>
		<IconMdiInformation class="mr-1 h-6 w-6 align-middle" />
		{$_('product.edit.sections.origin_traceability', { default: 'Traceability & Origins' })}
		<button type="button" class="ml-2 align-middle" aria-label="Info" onclick={toggleInfo}>
			<IconMdiHelpCircleOutline
				class="ml-4 h-6 w-6 text-primary hover:cursor-pointer hover:text-primary/70"
			/>
		</button>
	</h2>
	{#if showInfo}
		<div
			class="relative mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary-content shadow-sm"
		>
			<button
				type="button"
				class="absolute top-2 right-2 m-2 rounded p-1 hover:bg-primary/10"
				aria-label="Close"
				onclick={toggleInfo}
			>
				<IconMdiClose class="h-5 w-5 text-primary" />
			</button>
			<IconMdiInformationOutline class="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
			<span class="p-6 text-sm text-base-content/80 sm:text-base">
				{$_('product.edit.info.origin_traceability', {
					default:
						'Provide origin and traceability information, such as manufacturing places, origins of ingredients, and traceability codes.'
				})}
			</span>
		</div>
	{/if}
{/if}

<div class="space-y-6">
	<!-- Manufacturing Places -->
	<div class="form-control w-full">
		<label class="label" for="manufacturing_places">
			<span class="label-text text-sm font-medium sm:text-base"
				>{$_('product.edit.manufacturing_places')}</span
			>
		</label>
		<input
			id="manufacturing_places"
			type="text"
			class="input w-full text-sm focus:border-primary focus:outline-none sm:text-base"
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

	<!-- Origins -->
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

	<!-- Traceability Codes -->
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
			<p>
				More info:
				<a
					href="https://wiki.openfoodfacts.org/Food_Traceability_Codes/EU_Food_establishments"
					target="_blank"
					rel="noopener noreferrer"
					class="link"
				>
					Food Traceability Codes Wiki
				</a>
			</p>
		</div>
	</div>
</div>
