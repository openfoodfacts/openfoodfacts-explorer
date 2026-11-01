<script lang="ts">
	import { _ } from '#lib/i18n/index.js';
	import { createProductsApi, unselectImageV3, type Product } from '#lib/api.js';
	import { getLanguageName } from '#lib/languages.js';

	import InfoTooltip from '../InfoTooltip.svelte';
	import ImageButton from '../ImageButton.svelte';

	import IconMdiFormatListBulleted from '@iconify-svelte/mdi/format-list-bulleted';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiTextRecognition from '@iconify-svelte/mdi/text-recognition';
	import IconMdiLanguage from '@iconify-svelte/mdi/language';
	import IconMdiPencil from '@iconify-svelte/mdi/pencil';
	import IconMdiImageRemove from '@iconify-svelte/mdi/image-remove';

	import { getShortcutCtx } from '#lib/stores/shortcuts.js';
	import { onMount, tick } from 'svelte';
	import { focusEditField } from '#lib/utils/fieldFocus.js';
	import { trackOffEvent } from '#lib/analytics.js';
	import TagsString from '#lib/ui/inputs/TagsString.svelte';
	import { getToastCtx } from '#lib/stores/toasts.js';
	import { photoEditRequest } from '#lib/stores/photoEditRequest.js';

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
	let unselectingLang = $state<string | null>(null);

	const toast = getToastCtx();

	function editIngredientsImage(e: MouseEvent, languageCode: string) {
		photoEditRequest.set({
			typeId: 'ingredients',
			language: languageCode,
			returnTo: e.currentTarget as HTMLElement
		});
	}

	async function unselectIngredientsImage(languageCode: string) {
		unselectingLang = languageCode;
		try {
			const result = await unselectImageV3(fetch, product.code, 'ingredients', languageCode);
			const status = result.data?.status;
			if (result.error || (status !== 'success' && status !== 'success_with_warnings')) {
				console.warn('Image unselect failed:', result.error ?? result.data?.errors ?? status);
				toast.error($_('product.edit.images.toast.unselect_failed'));
				return;
			}

			// Drop the selection locally so unsaved edits in the form are kept
			const images = { ...product.images };
			delete images[`ingredients_${languageCode}`];
			product = { ...product, images };

			// The focused button is gone with the image; keep keyboard users in this language's tab
			await tick();
			document.getElementById(`ingredients-list-${languageCode}`)?.focus({ preventScroll: true });

			toast.success($_('product.edit.images.toast.unselect_success'));
			trackOffEvent('contribution', 'image_unselected', 'ingredients');
		} catch (error) {
			console.error('Error unselecting image:', error);
			toast.error($_('product.edit.images.toast.unselect_error'));
		} finally {
			unselectingLang = null;
		}
	}

	function toggleInfo() {
		showInfo = !showInfo;
	}

	async function performOCR(languageCode: string) {
		if (!getIngredientsImage(languageCode)) {
			throw new Error('No ingredients image available for OCR');
		}

		ocrLoading = true;
		trackOffEvent('contribution', 'ocr_started', 'ingredients');

		try {
			const openfoodfacts = createProductsApi(fetch);
			const imagefield = `ingredients_${languageCode}`;

			console.debug(`Performing OCR for ${product.code} with imagefield: ${imagefield}`);

			// TODO: The typing is incorrect hence, doing casting. Needs to be fixed.
			const { data: tmpData, error } = await openfoodfacts.performOCR(product.code, imagefield);
			if (error) {
				console.error('Error performing OCR:', error);
				trackOffEvent('contribution', 'ocr_failed', 'ingredients');
				return;
			}

			const data = tmpData as OCRResult;
			if (!data || typeof data !== 'object') {
				console.warn('OCR failed - invalid result:', data);
				trackOffEvent('contribution', 'ocr_failed', 'ingredients');
				return;
			}
			const ocrText = data.ingredients_text_from_image || data.text || data.ingredients_text || '';
			if (!ocrText || !ocrText.trim()) {
				console.warn('OCR returned empty text:', data);
				trackOffEvent('contribution', 'ocr_failed', 'ingredients');
				return;
			}

			// Set OCR result
			product[`ingredients_text_${languageCode}`] = ocrText;
			trackOffEvent('contribution', 'ocr_succeeded', 'ingredients');
		} catch (error) {
			console.error('Error performing OCR:', error);
			trackOffEvent('contribution', 'ocr_failed', 'ingredients');
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
<div class="tabs tabs-lift">
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

						<div class="flex flex-wrap gap-2">
							<!-- OCR Button -->
							<button
								type="button"
								class="btn btn-outline btn-sm"
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

							<button
								type="button"
								class="btn gap-2 btn-outline btn-sm"
								onclick={(e) => editIngredientsImage(e, code)}
							>
								<IconMdiPencil class="h-4 w-4" aria-hidden="true" />
								<span>{$_('product.edit.images.edit_photo', { default: 'Edit Photo' })}</span>
							</button>

							<button
								type="button"
								class="btn gap-2 btn-outline btn-error btn-sm"
								disabled={unselectingLang === code || ocrLoading}
								onclick={() => unselectIngredientsImage(code)}
							>
								{#if unselectingLang === code}
									<span class="loading h-4 w-4 loading-spinner"></span>
									<span>{$_('product.edit.images.unselecting', { default: 'Unselecting...' })}</span
									>
								{:else}
									<IconMdiImageRemove class="h-4 w-4" aria-hidden="true" />
									<span
										>{$_('product.edit.images.unselect_image', { default: 'Unselect Image' })}</span
									>
								{/if}
							</button>
						</div>
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
