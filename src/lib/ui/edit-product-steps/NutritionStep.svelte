<script lang="ts">
	import InfoTooltip from '../InfoTooltip.svelte';
	import { _ } from '$lib/i18n';
	import { getLanguageName } from '$lib/languages';
	import { NUTRIENTS, type NutrientKey, type Product, type Nutriments } from '$lib/api';
	import { preferences } from '$lib/settings';
	import { userInfo } from '$lib/stores/user';

	import IconMdiNutrition from '@iconify-svelte/mdi/nutrition';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiAlert from '@iconify-svelte/mdi/alert';
	import IconMdiAlertCircle from '@iconify-svelte/mdi/alert-circle';
	import IconMdiSwapHorizontal from '@iconify-svelte/mdi/swap-horizontal';
	import IconMdiDeleteSweep from '@iconify-svelte/mdi/delete-sweep';

	import ImageButton from '../ImageButton.svelte';
	import { analyzeNutrition } from './nutrition';

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
	const EMPTY_NUTRIENT_TOOLTIPS: Record<string, string> = {
		fibers: 'product.edit.tooltips.empty_fiber'
	};

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

	function switchKjAndKcal() {
		const energyKj = product.nutriments?.['energy-kj_100g'] ?? product.nutriments?.['energy_100g'];
		const energyKcal = product.nutriments?.['energy-kcal_100g'];

		product = {
			...product,
			nutriments: {
				...product.nutriments,
				'energy-kj_100g': energyKcal,
				'energy-kcal_100g': energyKj
			}
		};
	}

	let analysisResults = $derived(analyzeNutrition(product));

	const bySeverity = (a: { severity: string }, b: { severity: string }) => {
		if (a.severity === b.severity) return 0;
		if (a.severity === 'error') return -1;
		return 1;
	};

	let issuesByField = $derived((keys: string | string[]) => {
		const keysArray = Array.isArray(keys) ? keys : [keys];

		return analysisResults
			.filter((r) => r.field && keysArray.includes(r.field))
			.toSorted(bySeverity);
	});

	let fieldInputClasses = $derived((field: string | string[]) => {
		const results = issuesByField(field);
		if (results.length === 0) return '';
		if (results.some((r) => r.severity === 'error')) return 'input-error';
		if (results.some((r) => r.severity === 'warning')) return 'input-warning';
		return '';
	});

	function wipeAllNutrientValues() {
		product = {
			...product,
			nutriments: {} as Nutriments
		};
		additionalNutrients = [];
	}
</script>

<h2
	class="text-primary mb-6 items-center justify-center gap-2 text-center text-base font-bold md:text-lg lg:text-xl xl:text-2xl"
>
	<IconMdiNutrition class="mr-1 h-6 w-6 align-middle" />
	{$_('product.edit.sections.nutrition')}
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
		<span class="text-base-content/80 p-6 text-sm sm:text-base"
			>{$_('product.edit.info.nutrition')}</span
		>
	</div>
{/if}
<div class="gap-4 max-md:flex max-md:flex-col-reverse lg:grid lg:grid-cols-2">
	<div>
		<div class="space-y-4">
			<div>
				<label>
					<span class="label mb-2 flex items-center gap-2 leading-0">
						{$_('product.edit.serving_size')}
						<InfoTooltip text={$_('product.edit.tooltips.serving_size')} />
					</span>title
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

			{#if $preferences.moderator && $userInfo?.isModerator}
				<div class="mb-4">
					<button type="button" class="btn btn-error btn-sm" onclick={wipeAllNutrientValues}>
						<IconMdiDeleteSweep class="h-4 w-4" />
						{$_('product.edit.remove_all_nutrient_values')}
					</button>
				</div>
			{/if}

			<!-- Energy -->
			<fieldset class="fieldset">
				<div class="flex gap-2">
					<label class={['input grow', fieldInputClasses('energy')]}>
						<span class="label">
							{$_('product.edit.energy')}
						</span>
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
						{#if issuesByField('energy').length > 0}
							{@const issue = issuesByField('energy')[0]}
							<div
								class={[
									'tooltip',
									issue?.severity === 'error' && 'tooltip-error',
									issue?.severity === 'warning' && 'tooltip-warning'
								]}
								data-tip={issue?.title}
							>
								<div class="ml-2 h-5 w-5">
									{#if issue.severity === 'warning'}
										<IconMdiAlert class="text-warning h-5 w-5" />
									{:else if issue.severity === 'error'}
										<IconMdiAlertCircle class="text-error h-5 w-5" />
									{/if}
								</div>
							</div>
						{/if}
					</label>

					<button
						type="button"
						class="btn btn-ghost btn-square btn-sm"
						aria-label="Swap units"
						onclick={switchKjAndKcal}
					>
						<IconMdiSwapHorizontal class="h-5 w-5" />
					</button>

					<label class={['input grow', fieldInputClasses('energy')]}>
						<span class="label">
							{$_('product.edit.energy')}
						</span>
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
						{#if issuesByField('energy').length > 0}
							{@const issue = issuesByField('energy')[0]}
							<div class="tooltip tooltip-warning" data-tip={issue?.title}>
								{#if issue.severity === 'warning'}
									<IconMdiAlert class="text-warning ml-2 h-5 w-5" />
								{:else if issue.severity === 'error'}
									<IconMdiAlertCircle class="text-error ml-2 h-5 w-5" />
								{/if}
							</div>
						{/if}
					</label>
				</div>
			</fieldset>
			<fieldset class="fieldset">
				{#each DEFAULT_SHOWN as nutrient (nutrient)}
					<label class={['input w-full', fieldInputClasses([nutrient, 'all'])]}>
						<span class="label w-60">
							<span class="flex grow items-center gap-2">
								{$_(`product.edit.nutrient.${nutrient}`)}

								{#if EMPTY_NUTRIENT_TOOLTIPS[nutrient] && (product.nutriments?.[nutrient] === undefined || product.nutriments?.[nutrient] === null || (product.nutriments?.[nutrient] as unknown) === '')}
									<InfoTooltip text={$_(EMPTY_NUTRIENT_TOOLTIPS[nutrient])} />
								{/if}
							</span>
							{#if issuesByField([nutrient, 'all']).length > 0}
								{@const issue = issuesByField(nutrient)[0] ?? issuesByField('all')[0]}
								<div
									class={[
										'tooltip cursor-default',
										issue?.severity === 'error' && 'tooltip-error',
										issue?.severity === 'warning' && 'tooltip-warning'
									]}
									data-tip={issue?.title}
								>
									{#if issue.severity === 'warning'}
										<IconMdiAlert class="text-warning ml-2 h-5 w-5 text-lg" />
									{:else if issue.severity === 'error'}
										<IconMdiAlertCircle class="text-error ml-2 h-5 w-5 text-lg" />
									{/if}
								</div>
							{/if}
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
							<IconMdiClose />
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

			{#if analysisResults.length > 0}
				<div class="divider"></div>
				<h3 class="text-lg font-bold">{$_('product.edit.nutrition_issues')}</h3>
				<p class="text-base-content/80 text-sm">
					{$_('product.edit.nutrition_issues_description')}
				</p>
				{#each analysisResults.toSorted(bySeverity) as result (result.title)}
					{#if result.severity === 'error'}
						<div class="alert alert-error mt-4">
							<IconMdiAlertCircle class="h-5 w-5" />
							<div>
								<p class="text-sm font-bold sm:text-base">{result.title}</p>
								{#if result.desc}
									<p class="mt-2 text-sm sm:text-base">{result.desc}</p>
								{/if}
							</div>
						</div>
					{:else if result.severity === 'warning'}
						<div class="alert alert-warning mt-4">
							<IconMdiAlertCircle class="h-5 w-5" />
							<div>
								<p class="text-sm font-bold sm:text-base">{result.title}</p>
								{#if result.desc}
									<p class="mt-2 text-sm sm:text-base">{result.desc}</p>
								{/if}
							</div>
						</div>
					{/if}
				{/each}
			{/if}
		{:else}
			<div class="alert alert-info">
				<IconMdiInformation class="h-5 w-5" />
				<span class="text-sm sm:text-base">{$_('product.edit.no_nutrition_specified')}</span>
			</div>
		{/if}
	</div>
	<div class="tabs tabs-box mb-4">
		{#each Object.keys(product.languages_codes ?? {}) as code (code)}
			{@const nutritionImage = getNutritionImage(code)}
			<input
				type="radio"
				name="nutrition_image_tabs"
				class="tab text-xs sm:text-sm"
				aria-label={getLanguageName(code)}
				checked={code === product.lang}
			/>
			<div class="tab-content p-6">
				{#if nutritionImage == null}
					<p class="alert alert-warning mb-4 text-sm sm:text-base">
						{$_('product.edit.no_nutrition_image', {
							values: { language: getLanguageName(code) }
						})}
					</p>
				{:else}
					<div class="sticky top-4">
						<ImageButton
							src={nutritionImage ?? undefined}
							alt={`Nutrition facts for ${getLanguageName(code)}`}
							productCode={product.code}
						/>
					</div>
				{/if}
			</div>
		{/each}
		{#if Object.keys(product.languages_codes ?? {}).length === 0}
			<div class="alert alert-warning text-sm sm:text-base">
				{$_('product.edit.no_languages_found')}
			</div>
		{/if}
	</div>
</div>
