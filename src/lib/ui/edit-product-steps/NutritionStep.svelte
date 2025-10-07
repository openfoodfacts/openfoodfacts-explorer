<script lang="ts">
	import InfoTooltip from '../InfoTooltip.svelte';
	import { _ } from '$lib/i18n';
	import { getLanguageName } from '$lib/languages';
	import { NUTRIENTS, type NutrientKey, type Product } from '$lib/api';

	import ImageButton from '../ImageButton.svelte';

	type Props = {
		product: Product;
		getNutritionImage: (language: string) => string | null;
		handleNutrimentInput: (e: Event, key: string) => void;
	};

	let { product = $bindable(), getNutritionImage, handleNutrimentInput }: Props = $props();

	const IGNORE_NUTRIENTS: NutrientKey[] = ['energy-kj', 'energy-kcal', 'energy'];
	const DEFAULT_SHOWN: NutrientKey[] = [
		'fat',
		'saturated-fat',
		'carbohydrates',
		'sugars',
		'proteins',
		'fibers',
		'salt',
		'sodium'
	];

	let showInfo = $state(false);
	function toggleInfo() {
		showInfo = !showInfo;
	}

	let additionalNutrients: NutrientKey[] = $state(
		NUTRIENTS.filter(
			(key) =>
				!IGNORE_NUTRIENTS.includes(key) &&
				!DEFAULT_SHOWN.includes(key) &&
				product.nutriments[key] != null
		)
	);

	let canAddNutrients = $derived(
		NUTRIENTS.filter((key) => {
			return (
				!IGNORE_NUTRIENTS.includes(key) && // Ignore certain nutrients
				!DEFAULT_SHOWN.includes(key) && // Ignore default shown nutrients
				!additionalNutrients.includes(key) // Ignore already added nutrients
			);
		})
	);
</script>

<h2
	class="text-primary mb-6 items-center justify-center gap-2 text-center text-base font-bold md:text-lg lg:text-xl xl:text-2xl"
>
	<span class="icon-[mdi--nutrition] mr-1 h-6 w-6 align-middle"></span>
	{$_('product.edit.sections.nutrition')}
	<button type="button" class="ml-2 align-middle" aria-label="Info" onclick={toggleInfo}>
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
			onclick={toggleInfo}
		>
			<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
		</button>
		<span class="icon-[mdi--information] text-primary mt-0.5 h-6 w-6 flex-shrink-0"></span>
		<span class="text-base-content/80 p-6 text-sm sm:text-base"
			>{$_('product.edit.info.nutrition')}</span
		>
	</div>
{/if}
<div class="tabs tabs-box mb-4">
	{#each Object.keys(product.languages_codes ?? {}) as code (code)}
		<input
			type="radio"
			name="nutrition_image_tabs"
			class="tab text-xs sm:text-sm"
			aria-label={getLanguageName(code)}
			checked={code === product.lang}
		/>
		<div class="tab-content p-6">
			{#if getNutritionImage(code) == null && product.lang !== code}
				<p class="alert alert-warning mb-4 text-sm sm:text-base">
					{$_('product.edit.no_nutrition_image_for_language', {
						values: { language: getLanguageName(code) }
					})}
				</p>
			{/if}

			<div class="gap-4 max-md:flex max-md:flex-col-reverse lg:grid lg:grid-cols-2">
				<div>
					<div class="space-y-4">
						<div>
							<label>
								<span class="label mb-2 flex items-center gap-2 leading-0">
									{$_('product.edit.serving_size')}
									<InfoTooltip text={$_('product.edit.tooltips.serving_size')} />
								</span>
								<input
									id="serving-size-input"
									type="text"
									class="input input-bordered w-full text-sm sm:text-base"
									bind:value={product.serving_size}
									placeholder="e.g., 100g, 1 serving (30g)"
								/>
							</label>
						</div>

						<div>
							<label class="label">
								<input type="checkbox" class="checkbox" bind:checked={product.no_nutrition_data} />
								<span>
									{$_('product.edit.no_nutrition_data')}
								</span>
							</label>
						</div>
					</div>

					{#if !product.no_nutrition_data}
						<div class="divider">
							<span class="text-sm font-medium opacity-60">
								{$_('product.edit.nutritional_values')}
							</span>
						</div>

						<!-- Energy -->
						<fieldset class="fieldset">
							<legend class="fieldset-legend">{$_('product.edit.energy')}</legend>
							<div class="flex gap-2">
								<label class="input w-full">
									<input
										id="energy-kj-input"
										type="number"
										value={product.nutriments?.['energy-kj_100g'] ??
											product.nutriments?.['energy_100g'] ??
											''}
										oninput={(e) => handleNutrimentInput(e, 'energy-kj_100g')}
										placeholder="2100"
										step="1"
										min="0"
									/>
									<span class="label">
										{$_('product.edit.si_kilojoules')}
									</span>
								</label>

								<label class="input w-full">
									<input
										id="energy-kcal-input"
										type="number"
										value={product.nutriments?.['energy-kcal_100g'] ?? ''}
										oninput={(e) => handleNutrimentInput(e, 'energy-kcal_100g')}
										placeholder="500"
										step="1"
										min="0"
									/>
									<span class="label">
										{$_('product.edit.si_kilocalories')}
									</span>
								</label>
							</div>

							{#each DEFAULT_SHOWN as nutrient (nutrient)}
								<label class="input w-full">
									<span class="label w-60">
										{$_(`product.edit.nutrient.${nutrient}`)}
									</span>
									<input
										id={`${nutrient}-input`}
										type="number"
										value={product.nutriments?.[nutrient] ?? ''}
										oninput={(e) => handleNutrimentInput(e, nutrient)}
										placeholder="0.0"
										step="0.1"
										min="0"
									/>
									<span class="label">
										<select
											class=""
											onchange={(e) => {
												const unit = e.currentTarget.value;
												product.nutriments[`${nutrient}_unit`] = unit;
											}}
											value={product.nutriments?.[`${nutrient}_unit`] ?? 'g'}
										>
											<option value="g">{$_('product.edit.si_grams')}</option>
											<option value="mg">{$_('product.edit.si_milligrams')}</option>
											<option value="µg">{$_('product.edit.si_micrograms')}</option>
										</select>
									</span>
								</label>
							{/each}
						</fieldset>

						<fieldset class="fieldset">
							<legend class="fieldset-legend">
								{$_('product.edit.additional_nutrients')}
							</legend>
							{#each additionalNutrients as nutrient (nutrient)}
								<div class="join">
									<label class="input join-item w-full">
										<span class="label w-60">
											{$_(`product.edit.nutrient.${nutrient}`)}
										</span>
										<input
											id={`${nutrient}-input`}
											type="number"
											value={product.nutriments?.[nutrient] ?? ''}
											oninput={(e) => handleNutrimentInput(e, nutrient)}
											placeholder="0.0"
											step="0.1"
											min="0"
										/>
										<span class="label">
											{$_('product.edit.si_grams')}
										</span>
									</label>
									<button
										type="button"
										class="btn btn-error join-item"
										aria-label="Remove nutrient"
										disabled={product.nutriments?.[nutrient] != null}
										onclick={() => {
											// Remove the nutrient from additional nutrients
											additionalNutrients = additionalNutrients.filter((n) => n !== nutrient);
										}}
									>
										<span class="icon-[mdi--close]"></span>
									</button>
								</div>
							{/each}

							{#if canAddNutrients.length > 0}
								<span class="label">
									{$_('product.edit.add_nutrient')}
								</span>

								<select
									class="select w-full"
									oninput={(e) => {
										const selectedNutrient = e.currentTarget.value;
										if (selectedNutrient) {
											// Add the selected nutrient to the additional nutrients
											additionalNutrients.push(selectedNutrient as NutrientKey);
										}
									}}
								>
									<option disabled selected>
										{$_('product.edit.additional_nutrients')}
									</option>
									{#each canAddNutrients as nutrient (nutrient)}
										<option value={nutrient}>
											{$_(`product.edit.nutrient.${nutrient}`)}
										</option>
									{/each}
								</select>
							{/if}
						</fieldset>
					{:else}
						<div class="alert alert-info">
							<span class="icon-[mdi--information] h-5 w-5"></span>
							<span class="text-sm sm:text-base">{$_('product.edit.no_nutrition_specified')}</span>
						</div>
					{/if}
				</div>

				{#if getNutritionImage(code)}
					<div>
						<div class="sticky top-4">
							<ImageButton
								src={getNutritionImage(code) ?? undefined}
								alt={`Nutrition facts for ${getLanguageName(code)}`}
							/>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/each}
	{#if Object.keys(product.languages_codes ?? {}).length === 0}
		<div class="alert alert-warning text-sm sm:text-base">
			{$_('product.edit.no_languages_found')}
		</div>
	{/if}
</div>
