<script lang="ts">
	import InfoTooltip from '../InfoTooltip.svelte';
	import { _ } from '$lib/i18n';
	import { getLanguageName } from '$lib/languages';
	import { NUTRIENTS, type NutrientKey, type Product, type Nutriments } from '$lib/api';
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

	import { focusEditField, getShortcutCtx } from '$lib/stores/shortcuts';
	import { onMount } from 'svelte';

	type Props = {
		product: Product;
		units: string[];
		getNutritionImage: (language: string) => string | null;
		handleNutrimentInput: (e: Event, key: string) => void;
	};

	let { product = $bindable(), units, getNutritionImage, handleNutrimentInput }: Props = $props();

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

	const permissions = getPermissionsCtx();

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

	const bySeverity = (a: Issue, b: Issue) => {
		if (a.severity === b.severity) return 0;
		if (a.severity === 'error') return -1;
		return 1;
	};

	const INPUT_CLASS_BY_SEVERITY: Record<IssueSeverity, string> = {
		error: 'input-error',
		warning: 'input-warning'
	};
	const SEVERITY_PRECEDENCE: IssueSeverity[] = ['error', 'warning'];
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
		if (servingSizeValidationResult === 'valid') {
			return null;
		}

		const validationIssue = SERVING_SIZE_VALIDATION_ISSUES[servingSizeValidationResult];

		return {
			severity: validationIssue.severity,
			field: 'serving_size',
			title: $_(validationIssue.title),
			desc: $_(validationIssue.desc, { values: { examples: servingSizeExamples } })
		};
	});
	let servingSizePlaceholder = $derived(
		$_('product.edit.serving_size_placeholder', {
			values: { examples: servingSizeExamples }
		})
	);
	let nutritionIssues = $derived(getNutritionIssues(product));

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
		product = {
			...product,
			nutriments: {} as Nutriments
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
	{@const Icon = isError ? IconMdiAlertCircle : IconMdiAlert}
	{@const iconColorClass = isError ? 'text-error' : 'text-warning'}
	<div
		class={['tooltip cursor-default', isError ? 'tooltip-error' : 'tooltip-warning']}
		data-tip={issue.title}
	>
		<Icon class={[iconColorClass, 'ml-2 h-5 w-5 text-lg']} />
	</div>
{/snippet}

{#snippet issueAlert(issue: Issue)}
	{@const isError = issue.severity === 'error'}
	{@const Icon = isError ? IconMdiAlertCircle : IconMdiAlert}
	{@const alertColorClass = isError ? 'alert-error' : 'alert-warning'}
	<div class={[alertColorClass, 'alert mt-4']}>
		<Icon class="h-5 w-5" />
		<div>
			<p class="text-sm font-bold sm:text-base">{issue.title}</p>
			{#if issue.desc}
				<p class="mt-2 text-sm sm:text-base">{issue.desc}</p>
			{/if}
		</div>
	</div>
{/snippet}

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
						{#if servingSizeIssue}
							{@render issueTooltip(servingSizeIssue)}
						{/if}
					</span>
					<input
						id="serving-size-input"
						type="text"
						class={['input input-bordered w-full text-sm sm:text-base', servingSizeInputClass]}
						value={product.serving_size ?? ''}
						oninput={handleServingSize}
						placeholder={servingSizePlaceholder}
					/>
				</label>
				{#if servingSizeIssue}
					{@render issueAlert(servingSizeIssue)}
				{/if}
			</div>

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
					<span class="badge badge-info badge-outline badge-sm">
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

			{#if nutritionIssues.length > 0}
				<div class="divider"></div>
				<h3 class="text-lg font-bold">{$_('product.edit.nutrition_issues')}</h3>
				<p class="text-base-content/80 text-sm">
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
