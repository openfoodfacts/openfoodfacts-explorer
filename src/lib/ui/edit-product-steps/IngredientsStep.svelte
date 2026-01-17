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
	};

	let { product = $bindable(), getIngredientsImage }: Props = $props();

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

		try {
			const openfoodfacts = createProductsApi(fetch);
			const imagefield = `ingredients_${languageCode}`;

			console.log(`Performing OCR for ${product.code} with imagefield: ${imagefield}`);

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
</script>

<h2
	class="text-primary mb-6 items-center justify-center gap-2 text-center text-base font-bold md:text-lg lg:text-xl xl:text-2xl"
>
	<IconMdiFormatListBulleted class="mr-1 h-6 w-6 align-middle" />
	{$_('product.edit.sections.ingredients')}
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
			{$_('product.edit.info.ingredients')}
		</span>
	</div>
{/if}
<div class="tabs tabs-box">
	{#each Object.keys(product.languages_codes ?? {}) as code (code)}
		<input
			type="radio"
			name="ingredients_tabs"
			class="tab text-xs sm:text-sm"
			aria-label={getLanguageName(code)}
			checked={code === product.lang}
		/>
		<div class="tab-content form-control p-6">
			<div class="mb-4">
				{#if getIngredientsImage(code) != null}
					<div class="flex flex-col gap-3">
						<ImageButton src={getIngredientsImage(code) ?? undefined} />

						<!-- OCR Button -->
						<button
							type="button"
							class="btn btn-outline btn-sm self-start"
							class:loading={ocrLoading}
							disabled={ocrLoading}
							onclick={() => performOCR(code)}
						>
							{#if ocrLoading}
								<span class="loading loading-spinner h-4 w-4"></span>
								<span>Extracting ingredients...</span>
							{:else}
								<IconMdiTextRecognition class="h-4 w-4" />
								<span>Extract ingredients from image</span>
							{/if}
						</button>
					</div>
				{:else}
					<p class="alert alert-warning mb-4 text-sm sm:text-base">
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
				class="textarea textarea-bordered w-full text-sm sm:text-base"
				class:opacity-50={ocrLoading}
				bind:value={product[`ingredients_text_${code}`]}
				disabled={ocrLoading}
			></textarea>
		</div>
	{/each}
	{#if Object.keys(product.languages_codes ?? {}).length === 0}
		<div class="alert alert-warning text-sm sm:text-base">
			{$_('product.edit.no_languages_found')}
		</div>
	{/if}
</div>
