<script lang="ts">
	import { _ } from '$lib/i18n';
	import { createProductsApi, type Product } from '$lib/api';
	import { getLanguageName } from '$lib/languages';

	import InfoTooltip from '../InfoTooltip.svelte';
	import ImageButton from '../ImageButton.svelte';

	import IconMdiFormatListBulleted from '@iconify-svelte/mdi/format-list-bulleted';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiTextRecognition from '@iconify-svelte/mdi/text-recognition';
	import IconMdiLanguage from '@iconify-svelte/mdi/language';

	import { getShortcutCtx } from '$lib/stores/shortcuts';
	import { onMount } from 'svelte';
	import { focusEditField } from '$lib/utils/fieldFocus';
	import { trackOffEvent } from '$lib/analytics';
	import TagsString from '../../../routes/products/[barcode]/edit/TagsString.svelte';

	type OCRResult = {
		status?: number;
		ingredients_text_from_image?: string | null;
		ingredients_text_from_image_orig?: string | null;
		text?: string;
		ingredients_text?: string;
		ocr_engine?: string;
	};

	type Props = {
		product: Product;
		getIngredientsImage: (language: string) => string | null;
		allergenNames?: string[];
		editMode?: boolean;
	};

	let {
		product = $bindable(),
		getIngredientsImage,
		allergenNames = [],
		editMode = false
	}: Props = $props();

	let showInfo = $state(false);
	let ocrLoading = $state(false);

	function toggleInfo() {
		showInfo = !showInfo;
	}

	async function performOCR(languageCode: string) {
		if (!getIngredientsImage(languageCode)) {
			throw new Error('No ingredients image available for OCR');
		}

		ocrLoading = true;
		trackOffEvent('product', 'launch_ocr', 'ingredients');

		try {
			const openfoodfacts = createProductsApi(fetch);
			const imagefield = `ingredients_${languageCode}`;

			console.debug(`Performing OCR for ${product.code} with imagefield: ${imagefield}`);

			// TODO: The typing is incorrect hence, doing casting. Needs to be fixed.
			const { data: tmpData, error } = await openfoodfacts.performOCR(product.code, imagefield);
			if (error) {
				console.error('Error performing OCR:', error);
				return;
			}

			const data = tmpData as OCRResult;
			if (!data || typeof data !== 'object') {
				console.warn('OCR failed - invalid result:', data);
				return;
			}
			const ocrText = data.ingredients_text_from_image || data.text || data.ingredients_text || '';
			if (!ocrText || !ocrText.trim()) {
				console.warn('OCR returned empty text:', data);
				return;
			}

			// Set OCR result
			product[`ingredients_text_${languageCode}`] = ocrText;
		} catch (error) {
			console.error('Error performing OCR:', error);
		} finally {
			ocrLoading = false;
		}
	}

	let activeLang = $state(product.lang);
	const shortcutCtx = getShortcutCtx();
	onMount(() => {
		shortcutCtx.set('Shift+I', {
			description: $_('product.shortcuts.edit_product_ingredients'),
			action: () => focusEditField(`#ingredients-list-${activeLang}`)
		});

		return () => {
			shortcutCtx.delete('Shift+I');
		};
	});
</script>

{#if !editMode}
	<h2
		class="mb-6 items-center justify-center gap-2 text-center text-base font-bold text-primary md:text-lg lg:text-xl xl:text-2xl"
	>
		<IconMdiFormatListBulleted class="mr-1 h-6 w-6 align-middle" />
		{$_('product.edit.sections.ingredients')}
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
			<IconMdiInformation class="mt-0.5 h-6 w-6 shrink-0 text-primary" />
			<span class="p-6 text-sm text-base-content/80 sm:text-base">
				{$_('product.edit.info.ingredients')}
			</span>
		</div>
	{/if}
{/if}
<div class="tabs-lift tabs">
	<div class="tab tab-disabled cursor-default">
		<IconMdiLanguage class="mr-1 h-5 w-5 align-middle" />
	</div>
	{#each Object.keys(product.languages_codes ?? {}) as code (code)}
		<input
			type="radio"
			name="ingredients_tabs"
			class="tab text-xs sm:text-sm"
			aria-label={getLanguageName(code)}
			checked={code === activeLang}
			onchange={() => (activeLang = code)}
		/>
		<div class="form-control tab-content border-base-300 bg-base-100 p-6">
			<div class="mb-4">
				{#if getIngredientsImage(code) != null}
					<div class="flex flex-col gap-3">
						<ImageButton src={getIngredientsImage(code) ?? undefined} productCode={product.code} />

						<!-- OCR Button -->
						<button
							type="button"
							class="btn self-start btn-outline btn-sm"
							class:loading={ocrLoading}
							disabled={ocrLoading}
							onclick={() => performOCR(code)}
						>
							{#if ocrLoading}
								<span class="loading h-4 w-4 loading-spinner"></span>
								<span>Extracting ingredients...</span>
							{:else}
								<IconMdiTextRecognition class="h-4 w-4" />
								<span>Extract ingredients from image</span>
							{/if}
						</button>
					</div>
				{:else}
					<p class="mb-4 alert text-sm alert-warning sm:text-base">
						{$_('product.edit.no_ingredients_image')}
					</p>
				{/if}
			</div>

			<label class="label text-sm sm:text-base" for={`ingredients-list-${code}`}>
				<span class="flex items-center gap-2">
					{$_('product.edit.ingredients_list')} ({getLanguageName(code)})
					<InfoTooltip text={$_('product.edit.tooltips.ingredients_list')} />
				</span>
			</label>

			<textarea
				id={`ingredients-list-${code}`}
				class="textarea-bordered textarea w-full text-sm sm:text-base"
				class:opacity-50={ocrLoading}
				value={product[`ingredients_text_${code}`] ?? ''}
				oninput={(e) => {
					product = {
						...product,
						[`ingredients_text_${code}`]: (e.currentTarget as HTMLTextAreaElement).value
					};
				}}
				disabled={ocrLoading}></textarea>
		</div>
	{/each}
	{#if Object.keys(product.languages_codes ?? {}).length === 0}
		<div class="alert text-sm alert-warning sm:text-base">
			{$_('product.edit.no_languages_found')}
		</div>
	{/if}
</div>

<div class="mt-6 space-y-6">
	<div class="flex w-full flex-col gap-1.5">
		<label class="label">
			<span class="flex items-center gap-2 text-sm font-medium sm:text-base">
				{$_('product.edit.allergens', { default: 'Allergens' })}
				<InfoTooltip
					text={$_('product.edit.tooltips.allergens', {
						default: 'Allergens present in the product'
					})}
				/>
			</span>
		</label>
		<TagsString
			tagsString={product.allergens ?? ''}
			autocomplete={allergenNames}
			onChange={(v) => {
				product = { ...product, allergens: v };
			}}
		/>
	</div>

	<div class="flex w-full flex-col gap-1.5">
		<label class="label">
			<span class="flex items-center gap-2 text-sm font-medium sm:text-base">
				{$_('product.edit.traces', { default: 'Traces' })}
				<InfoTooltip
					text={$_('product.edit.tooltips.traces', {
						default: 'Traces of allergens that may be present'
					})}
				/>
			</span>
		</label>
		<TagsString
			tagsString={product.traces ?? ''}
			autocomplete={allergenNames}
			onChange={(v) => {
				product = { ...product, traces: v };
			}}
		/>
	</div>
</div>
