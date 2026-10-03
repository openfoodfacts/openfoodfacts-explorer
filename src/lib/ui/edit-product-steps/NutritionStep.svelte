<script lang="ts">
	import InfoTooltip from '../InfoTooltip.svelte';
	import { _, locale } from '$lib/i18n';
	import { getLanguageName } from '$lib/languages';
	import {
		getNutrients,
		getMissingNutrientOptions,
		getSelectableNutrients,
		NUTRIENTS,
		type NutrientOption,
		type NutrientKey,
		type Product,
		type Nutriments
	} from '$lib/api';
	import { preferences } from '$lib/settings';
	import { getPermissionsCtx } from '$lib/stores/user';

	import IconMdiNutrition from '@iconify-svelte/mdi/nutrition';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiAlert from '@iconify-svelte/mdi/alert';
	import IconMdiAlertCircle from '@iconify-svelte/mdi/alert-circle';
	import IconMdiSwapHorizontal from '@iconify-svelte/mdi/swap-horizontal';
	import IconMdiDeleteSweep from '@iconify-svelte/mdi/delete-sweep';

	import ImageButton from '../ImageButton.svelte';
	import {
		getServingSizeValidationResult,
		getNutritionIssues,
		type Issue,
		type IssueSeverity
	} from './nutrition';

	import { getShortcutCtx } from '$lib/stores/shortcuts';
	import { onMount } from 'svelte';
	import { focusEditField } from '$lib/utils/fieldFocus';

	type Props = {
		product: Product;
		units: string[];
		getNutritionImage: (language: string) => string | null;
		handleNutrimentInput: (e: Event, key: string) => void;
		editMode?: boolean;
	};

	let {
		product = $bindable(),
		units,
		getNutritionImage,
		handleNutrimentInput,
		editMode = false
	}: Props = $props();

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
	const FALLBACK_NUTRIENTS: NutrientOption[] = [
		...NUTRIENTS.map((id) => ({
			id,
			name: id,
			unit: id === 'energy-kcal' ? 'kcal' : id.startsWith('energy') ? 'kJ' : 'g'
		})),
		{ id: 'added-sugars', name: 'Added sugars', unit: 'g' },
		{ id: 'calcium', name: 'Calcium', unit: 'mg' },
		{
			id: 'carbohydrates-total',
			name: 'Total carbohydrates (includes fiber)',
			unit: 'g'
		},
		{ id: 'cholesterol', name: 'Cholesterol', unit: 'mg' },
		{ id: 'iron', name: 'Iron', unit: 'mg' },
		{ id: 'potassium', name: 'Potassium', unit: 'mg' },
		{ id: 'trans-fat', name: 'Trans fat', unit: 'g' },
		{ id: 'vitamin-d', name: 'Vitamin D', unit: 'µg' }
	];
	const DEFAULT_NUTRIENT_IDS = new Set<string>([...DEFAULT_SHOWN, ...IGNORE_NUTRIENTS, 'fiber']);

	let showInfo = $state(false);
	function toggleInfo() {
		showInfo = !showInfo;
	}

	const permissions = getPermissionsCtx();

	let nutrientCatalog = $state<NutrientOption[]>(FALLBACK_NUTRIENTS);
	let additionalNutrients = $state<string[]>([]);
	let nutrientLoadFailed = $state(false);

	function addPersistedNutrientsToFallbackCatalog() {
		nutrientCatalog = [
			...nutrientCatalog,
			...getMissingNutrientOptions(product.nutriments, nutrientCatalog)
		];
	}

	function syncExistingNutrients() {
		const existingNutrients = nutrientCatalog
			.filter((nutrient) => !DEFAULT_NUTRIENT_IDS.has(nutrient.id))
			.filter((nutrient) => product.nutriments?.[nutrient.id] != null)
			.map((nutrient) => nutrient.id);

		additionalNutrients = [...new Set([...additionalNutrients, ...existingNutrients])];
	}

	addPersistedNutrientsToFallbackCatalog();
	syncExistingNutrients();

	$effect(() => {
		const currentLocale = $locale ?? 'en';
		const country = $preferences.country;
		let cancelled = false;

		getNutrients(fetch, currentLocale, country)
			.then((nutrients) => {
				if (cancelled) return;
				nutrientCatalog = nutrients;
				nutrientLoadFailed = false;
				syncExistingNutrients();
			})
			.catch((error) => {
				if (cancelled) return;
				console.error('Failed to load nutrients', error);
				nutrientLoadFailed = true;
			});

		return () => {
			cancelled = true;
		};
	});

	let nutrientById = $derived(new Map(nutrientCatalog.map((nutrient) => [nutrient.id, nutrient])));

	let canAddNutrients = $derived(
		getSelectableNutrients(nutrientCatalog, DEFAULT_NUTRIENT_IDS, additionalNutrients)
	);

	function nutrientName(nutrient: NutrientOption) {
		return $_(`product.edit.nutrient.${nutrient.id}`, { default: nutrient.name });
	}

	function addNutrient(id: string) {
		if (!id || additionalNutrients.includes(id)) return;

		additionalNutrients = [...additionalNutrients, id];
		const unit = nutrientById.get(id)?.unit;
		if (unit && product.nutriments?.[`${id}_unit`] == null) {
			product = {
				...product,
				nutriments: { ...product.nutriments, [`${id}_unit`]: unit }
			};
		}
	}

	function removeNutrient(id: string) {
		additionalNutrients = additionalNutrients.filter((nutrient) => nutrient !== id);
		product = {
			...product,
			nutriments: Object.fromEntries(
				Object.entries(product.nutriments ?? {}).filter(
					([key]) => key !== id && key !== `${id}_unit`
				)
			) as Nutriments
		};
	}

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

	function handleServingSize(event: Event) {
		const input = event.currentTarget as HTMLInputElement;

		product = {
			...product,
			serving_size: input.value
		};
	}

	function handleNoNutritionData(event: Event) {
		const input = event.currentTarget as HTMLInputElement;

		product = {
			...product,
			no_nutrition_data: input.checked
		};
	}

	const SEVERITY_PRIORITY: Record<IssueSeverity, number> = {
		error: 3,
		warning: 2,
		info: 1
	};

	const bySeverity = (a: Issue, b: Issue) => {
		const priorityA = SEVERITY_PRIORITY[a.severity] ?? 0;
		const priorityB = SEVERITY_PRIORITY[b.severity] ?? 0;
		return priorityB - priorityA;
	};

	const INPUT_CLASS_BY_SEVERITY: Record<IssueSeverity, string> = {
		error: 'input-error',
		warning: 'input-warning',
		info: 'input-info'
	};
	const SEVERITY_PRECEDENCE: IssueSeverity[] = ['error', 'warning', 'info'];
	const SERVING_SIZE_VALIDATION_ISSUES = {
		'missing-number': {
			severity: 'error',
			title: 'product.edit.serving_size_issues.missing_number.title',
			desc: 'product.edit.serving_size_issues.missing_number.desc'
		},
		'missing-unit': {
			severity: 'error',
			title: 'product.edit.serving_size_issues.missing_unit.title',
			desc: 'product.edit.serving_size_issues.missing_unit.desc'
		},
		'unknown-unit': {
			severity: 'warning',
			title: 'product.edit.serving_size_issues.unknown_unit.title',
			desc: 'product.edit.serving_size_issues.unknown_unit.desc'
		}
	} as const;

	function inputClassForSeverity(severity: IssueSeverity | undefined): string {
		return severity == null ? '' : INPUT_CLASS_BY_SEVERITY[severity];
	}

	function highestSeverity(issues: Issue[]): IssueSeverity | undefined {
		for (const severity of SEVERITY_PRECEDENCE) {
			if (issues.some((issue) => issue.severity === severity)) {
				return severity;
			}
		}

		return undefined;
	}

	let servingSizeExamples = $derived($_('product.edit.serving_size_examples'));
	let servingSizeValidationResult = $derived(
		getServingSizeValidationResult(product.serving_size, units)
	);
	let servingSizeIssue = $derived.by((): Issue | null => {
		if (servingSizeValidationResult !== 'valid') {
			const validationIssue = SERVING_SIZE_VALIDATION_ISSUES[servingSizeValidationResult];
			return {
				severity: validationIssue.severity,
				field: 'serving_size',
				title: $_(validationIssue.title, { default: validationIssue.title }),
				desc: $_(validationIssue.desc, {
					default: validationIssue.desc,
					values: { examples: servingSizeExamples }
				})
			};
		}

		const apiError = apiQualityErrors.find((e) => e.field === 'serving_size');
		if (apiError) {
			return {
				severity: apiError.severity,
				field: 'serving_size',
				title: $_(apiError.message, { default: 'Serving size issue' }),
				desc: ''
			};
		}

		return null;
	});
	let servingSizePlaceholder = $derived(
		$_('product.edit.serving_size_placeholder', {
			values: { examples: servingSizeExamples }
		})
	);
	import { getDataQualityCtx } from '$lib/stores/dataQuality';

	const quality = $derived(getDataQualityCtx());
	let apiQualityErrors = $derived(quality.forSection('nutrition'));
	let nutritionIssues = $derived([
		...getNutritionIssues(product),
		...apiQualityErrors.map((e) => ({
			severity: e.severity,
			field: e.field.replace('_100g', '').replace(/_/g, '-'),
			title: $_(e.message, { default: 'Nutrition issue' }),
			desc: ''
		}))
	]);

	let issuesByField = $derived((keys: string | string[]) => {
		const keysArray = Array.isArray(keys) ? keys : [keys];

		return nutritionIssues
			.filter((r) => r.field && keysArray.includes(r.field))
			.toSorted(bySeverity);
	});
	let servingSizeInputClass = $derived(inputClassForSeverity(servingSizeIssue?.severity));
	let fieldInputClasses = $derived((field: string | string[]) =>
		inputClassForSeverity(highestSeverity(issuesByField(field)))
	);

	function wipeAllNutrientValues() {
		if (!product.nutriments) return;

		product = {
			...product,
			nutriments: Object.fromEntries(
				Object.keys(product.nutriments).map((key) => [key, '' as string | number])
			) as Nutriments
		};
		additionalNutrients = [];
	}

	const shortcutCtx = getShortcutCtx();
	onMount(() => {
		shortcutCtx.set('Shift+N', {
			description: $_('product.shortcuts.edit_product_energy'),
			action: () => focusEditField('#energy-kj-input')
		});
		shortcutCtx.set('Shift+F', {
			description: $_('product.shortcuts.edit_product_fibers'),
			action: () => focusEditField('#fibers-input')
		});

		return () => {
			shortcutCtx.delete('Shift+N');
			shortcutCtx.delete('Shift+F');
		};
	});
</script>

{#snippet issueTooltip(issue: Issue)}
	{@const isError = issue.severity === 'error'}
	{@const isWarning = issue.severity === 'warning'}
	{@const Icon = isError ? IconMdiAlertCircle : isWarning ? IconMdiAlert : IconMdiInformation}
	{@const iconColorClass = isError ? 'text-error' : isWarning ? 'text-warning' : 'text-info'}
	<div
		class={[
			'tooltip cursor-default',
			isError ? 'tooltip-error' : isWarning ? 'tooltip-warning' : 'tooltip-info'
		]}
		data-tip={issue.title}
	>
		<Icon class={[iconColorClass, 'ml-2 h-5 w-5 text-lg']} />
	</div>
{/snippet}

{#snippet issueAlert(issue: Issue)}
	{@const isError = issue.severity === 'error'}
	{@const isWarning = issue.severity === 'warning'}
	{@const Icon = isError ? IconMdiAlertCircle : isWarning ? IconMdiAlert : IconMdiInformation}
	{@const alertColorClass = isError ? 'alert-error' : isWarning ? 'alert-warning' : 'alert-info'}
	<div class={[alertColorClass, 'mt-4 alert']}>
		<Icon class="h-5 w-5" />
		<div>
			<p class="text-sm font-bold sm:text-base">{issue.title}</p>
			{#if issue.desc}
				<p class="mt-2 text-sm sm:text-base">{issue.desc}</p>
			{/if}
		</div>
	</div>
{/snippet}

{#if !editMode}
	<h2
		class="mb-6 items-center justify-center gap-2 text-center text-base font-bold text-primary md:text-lg lg:text-xl xl:text-2xl"
	>
		<IconMdiNutrition class="mr-1 h-6 w-6 align-middle" />
		{$_('product.edit.sections.nutrition')}
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
			<IconMdiInformation class="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
			<span class="p-6 text-sm text-base-content/80 sm:text-base"
				>{$_('product.edit.info.nutrition')}</span
			>
		</div>
	{/if}
{/if}
<div class="gap-4 max-md:flex max-md:flex-col-reverse lg:grid lg:grid-cols-2">
	<div>
		<div class="space-y-4">
			<div>
				<label class="label">
					<input
						type="checkbox"
						class="checkbox"
						checked={product.no_nutrition_data ?? false}
						onchange={handleNoNutritionData}
					/>
					<span>
						{$_('product.edit.no_nutrition_data')}
					</span>
				</label>
			</div>

			{#if !product.no_nutrition_data}
				<div>
					<label>
						<span class="label mb-2 flex items-center gap-2 leading-0">
							{$_('product.edit.serving_size')}
							<InfoTooltip text={$_('product.edit.tooltips.serving_size')} />
							{#if servingSizeIssue}
								{@render issueTooltip(servingSizeIssue)}
							{/if}
						</span>
						<input
							id="serving-size-input"
							type="text"
							class={['input-bordered input w-full text-sm sm:text-base', servingSizeInputClass]}
							value={product.serving_size ?? ''}
							oninput={handleServingSize}
							placeholder={servingSizePlaceholder}
						/>
					</label>
					{#if servingSizeIssue}
						{@render issueAlert(servingSizeIssue)}
					{/if}
				</div>
			{/if}
		</div>

		{#if !product.no_nutrition_data}
			<div class="divider">
				<span class="text-sm font-medium opacity-60">
					{$_('product.edit.nutritional_values')}
				</span>
			</div>

			{#if $preferences.moderator && permissions.isModerator}
				<div class="mb-4 flex items-center gap-2">
					<button type="button" class="btn btn-error btn-sm" onclick={wipeAllNutrientValues}>
						<IconMdiDeleteSweep class="h-4 w-4" />
						{$_('product.edit.remove_all_nutrient_values')}
					</button>
					<span class="badge badge-outline badge-sm badge-info">
						{$_('product.edit.moderator_only')}
					</span>
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
							{@render issueTooltip(issuesByField('energy')[0])}
						{/if}
					</label>

					<button
						type="button"
						class="btn btn-square btn-ghost btn-sm"
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
							{@render issueTooltip(issuesByField('energy')[0])}
						{/if}
					</label>
				</div>
			</fieldset>
			<fieldset class="fieldset">
				{#each DEFAULT_SHOWN as nutrient (nutrient)}
					{@const issueKeys = [nutrient, 'all']}
					{@const issue = issuesByField(issueKeys)[0]}
					<label class={['input w-full', fieldInputClasses(issueKeys)]}>
						<span class="label w-60">
							<span class="flex grow items-center gap-2">
								{$_(`product.edit.nutrient.${nutrient}`)}

								{#if EMPTY_NUTRIENT_TOOLTIPS[nutrient] && (product.nutriments?.[nutrient] === undefined || product.nutriments?.[nutrient] === null || (product.nutriments?.[nutrient] as unknown) === '')}
									<InfoTooltip text={$_(EMPTY_NUTRIENT_TOOLTIPS[nutrient])} />
								{/if}
							</span>
							{#if issue}
								{@render issueTooltip(issue)}
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
					{@const nutrientDetails = nutrientById.get(nutrient)}
					<div class="join">
						<label class="input join-item w-full">
							<span class="label w-60">
								{nutrientDetails ? nutrientName(nutrientDetails) : nutrient}
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
								{product.nutriments?.[`${nutrient}_unit`] ?? nutrientDetails?.unit ?? 'g'}
							</span>
						</label>
						<button
							type="button"
							class="btn join-item btn-square shrink-0 btn-error disabled:border-base-300 disabled:bg-base-300 disabled:text-base-content/60"
							aria-label={$_('product.edit.remove_nutrient', { default: 'Remove nutrient' })}
							title={$_('product.edit.remove_nutrient', { default: 'Remove nutrient' })}
							disabled={product.nutriments?.[nutrient] !== undefined &&
								(product.nutriments?.[nutrient] as string | number) !== ''}
							onclick={() => removeNutrient(nutrient)}
						>
							<IconMdiClose class="h-5 w-5" aria-hidden="true" />
						</button>
					</div>
				{/each}

				{#if canAddNutrients.length > 0}
					<span class="label">
						{$_('product.edit.add_nutrient')}
					</span>

					<select
						class="select w-full"
						onchange={(e) => {
							addNutrient(e.currentTarget.value);
							e.currentTarget.value = '';
						}}
					>
						<option disabled value="" selected>
							{$_('product.edit.additional_nutrients', {
								default: 'Additional nutrients'
							})}
						</option>
						{#each canAddNutrients as nutrient (nutrient)}
							<option value={nutrient.id}>
								{nutrientName(nutrient)}
							</option>
						{/each}
					</select>
				{/if}
				{#if nutrientLoadFailed}
					<p class="text-sm text-base-content/70">
						{$_('product.edit.nutrients_load_failed', {
							default: 'The complete nutrient list could not be loaded.'
						})}
					</p>
				{/if}
			</fieldset>

			{#if nutritionIssues.length > 0}
				<div class="divider"></div>
				<h3 class="text-lg font-bold">{$_('product.edit.nutrition_issues')}</h3>
				<p class="text-sm text-base-content/80">
					{$_('product.edit.nutrition_issues_description')}
				</p>
				{#each nutritionIssues.toSorted(bySeverity) as result (result.title)}
					{@render issueAlert(result)}
				{/each}
			{/if}
		{:else}
			<div class="alert alert-info">
				<IconMdiInformation class="h-5 w-5" />
				<span class="text-sm sm:text-base">{$_('product.edit.no_nutrition_specified')}</span>
			</div>
		{/if}
	</div>
	<div class="tabs tabs-box mb-4 bg-base-100">
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
					<p class="mb-4 alert text-sm alert-warning sm:text-base">
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
			<div class="alert text-sm alert-warning sm:text-base">
				{$_('product.edit.no_languages_found')}
			</div>
		{/if}
	</div>
</div>
