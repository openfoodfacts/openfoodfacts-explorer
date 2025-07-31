<script lang="ts">
	import { _ } from '$lib/i18n';
	import Card from './Card.svelte';
	import PreferenceSection from './PreferenceSection.svelte';
	import { userPreferences, type UserPreferences } from '$lib/stores/preferencesStore';

	type PreferencesFormProps = {
		onPreferenceChange?: (category: string, preference: string, value: string) => void;
		showClassifyToggle?: boolean;
		classifyProducts?: boolean;
		onClassifyToggle?: (value: boolean) => void;
		onClose?: () => void;
	}

	let {
		onPreferenceChange = () => {},
		showClassifyToggle = true,
		classifyProducts = false,
		onClassifyToggle = () => {},
		onClose = () => {}
	}: PreferencesFormProps = $props();

	function handlePreferenceChange(category: string, preference: string, value: string) {
		userPreferences.updatePreference(category as keyof UserPreferences, preference, value);
		onPreferenceChange(category, preference, value);
	}

	function resetToDefaults() {
		userPreferences.resetToDefaults();
		const defaults = userPreferences.getDefaults();
		Object.entries(defaults).forEach(([category, categoryPrefs]) => {
			Object.entries(categoryPrefs).forEach(([preference, value]) => {
				onPreferenceChange(category, preference, value);
			});
		});
	}

	// Section expanded states
	let nutritionalQualityExpanded = $state(true);
	let foodProcessingExpanded = $state(true);
	let allergensExpanded = $state(true);
	let ingredientsExpanded = $state(true);
	let labelsExpanded = $state(true);
	let environmentExpanded = $state(true);

	// Helper to create options
	const createOptions = () => [
		{ value: 'not-important', label: $_('preferences.options.not_important') },
		{ value: 'important', label: $_('preferences.options.important') },
		{ value: 'very-important', label: $_('preferences.options.very_important') },
		{ value: 'mandatory', label: $_('preferences.options.mandatory') }
	];

	// Preference options configuration
	const nutritionalQualityOptions = $derived([
		{
			id: 'nutriScore',
			label: $_('preferences.nutritional_quality.nutri_score'),
			icon: 'nutri-score',
			iconImg: 'nutriscore-a.svg',
			iconColor: 'bg-gradient-to-r from-red-500 via-yellow-500 to-green-500',
			options: createOptions()
		},
		{
			id: 'saltInLowQuantity',
			label: $_('preferences.nutritional_quality.salt_low'),
			icon: 'salt',
			iconImg: 'nutrient-level-salt-low.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'sugarsInLowQuantity',
			label: $_('preferences.nutritional_quality.sugars_low'),
			icon: 'sugar',
			iconImg: 'nutrient-level-sugars-low.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'fatInLowQuantity',
			label: $_('preferences.nutritional_quality.fat_low'),
			icon: 'fat',
			iconImg: 'nutrient-level-fat-low.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'saturatedFatInLowQuantity',
			label: $_('preferences.nutritional_quality.saturated_fat_low'),
			icon: 'saturated-fat',
			iconImg: 'nutrient-level-saturated-fat-low.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		}
	]);

	const foodProcessingOptions = $derived([
		{
			id: 'novaGroup',
			label: $_('preferences.food_processing.nova_group'),
			icon: 'nova',
			iconImg: 'nova-group-1.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'noOrFewAdditives',
			label: $_('preferences.food_processing.no_additives'),
			icon: 'additives',
			iconImg: '0-additives.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		}
	]);

	const allergenOptions = $derived([
		{
			id: 'withoutGluten',
			label: $_('preferences.allergens.without_gluten'),
			icon: 'gluten',
			iconImg: 'no-gluten.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'withoutMilk',
			label: $_('preferences.allergens.without_milk'),
			icon: 'milk',
			iconImg: 'no-milk.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'withoutEggs',
			label: $_('preferences.allergens.without_eggs'),
			icon: 'eggs',
			iconImg: 'no-eggs.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'withoutNuts',
			label: $_('preferences.allergens.without_nuts'),
			icon: 'nuts',
			iconImg: 'no-nuts.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'withoutPeanuts',
			label: $_('preferences.allergens.without_peanuts'),
			icon: 'peanuts',
			iconImg: 'no-peanuts.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'withoutSesameSeeds',
			label: $_('preferences.allergens.without_sesame'),
			icon: 'sesame',
			iconImg: 'no-sesame-seeds.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'withoutSoybeans',
			label: $_('preferences.allergens.without_soybeans'),
			icon: 'soybeans',
			iconImg: 'no-soybeans.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'withoutCelery',
			label: $_('preferences.allergens.without_celery'),
			icon: 'celery',
			iconImg: 'no-celery.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'withoutMustard',
			label: $_('preferences.allergens.without_mustard'),
			icon: 'mustard',
			iconImg: 'no-mustard.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'withoutLupin',
			label: $_('preferences.allergens.without_lupin'),
			icon: 'lupin',
			iconImg: 'no-lupin.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'withoutFish',
			label: $_('preferences.allergens.without_fish'),
			icon: 'fish',
			iconImg: 'no-fish.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'withoutCrustaceans',
			label: $_('preferences.allergens.without_crustaceans'),
			icon: 'crustaceans',
			iconImg: 'no-crustaceans.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'withoutMolluscs',
			label: $_('preferences.allergens.without_molluscs'),
			icon: 'molluscs',
			iconImg: 'no-molluscs.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'withoutSulphurDioxideAndSulphites',
			label: $_('preferences.allergens.without_sulphites'),
			icon: 'sulphites',
			iconImg: 'no-sulphur-dioxide-and-sulphites.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		}
	]);

	const ingredientOptions = $derived([
		{
			id: 'vegan',
			label: $_('preferences.ingredients.vegan'),
			icon: 'vegan',
			iconImg: 'vegan.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'vegetarian',
			label: $_('preferences.ingredients.vegetarian'),
			icon: 'vegetarian',
			iconImg: 'vegetarian.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'palmOilFree',
			label: $_('preferences.ingredients.palm_oil_free'),
			icon: 'palm-oil-free',
			iconImg: 'palm-oil-free.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		}
	]);

	const labelOptions = $derived([
		{
			id: 'organicFarming',
			label: $_('preferences.labels.organic'),
			icon: 'organic',
			iconImg: 'organic.svg',
			iconColor: 'bg-green-600',
			description: $_('preferences.labels.organic_description'),
			options: createOptions()
		},
		{
			id: 'fairTrade',
			label: $_('preferences.labels.fair_trade'),
			icon: 'fair-trade',
			iconImg: 'fair-trade.svg',
			iconColor: 'bg-blue-600',
			description: $_('preferences.labels.fair_trade_description'),
			options: createOptions()
		}
	]);

	const environmentOptions = $derived([
		{
			id: 'lowEnvironmentalImpact',
			label: $_('preferences.environment.low_impact'),
			icon: 'green-score',
			iconImg: 'green-score-a.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		},
		{
			id: 'lowRiskOfDeforestation',
			label: $_('preferences.environment.low_deforestation'),
			icon: 'forest',
			iconImg: 'forest-footprint-a.svg',
			iconColor: 'bg-green-600',
			options: createOptions()
		}
	]);

	// Value getters
	const getValueFromCategory = (category: keyof UserPreferences, id: string) => {
		return $userPreferences[category][id as keyof typeof $userPreferences[typeof category]];
	};
</script>

<Card>
	<div class="space-y-6">
		<!-- Header -->
		<div class="mb-6">
			<h2 class="text-xl font-semibold text-base-content mb-2">{$_('preferences.title')}</h2>
			<p class="text-sm text-base-content/70">
				{$_('preferences.subtitle')}
			</p>
		</div>

		<!-- Classify Products Toggle -->
		{#if showClassifyToggle}
			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-3">
					<input 
						type="checkbox" 
						class="toggle toggle-primary" 
						bind:checked={classifyProducts}
						onchange={() => onClassifyToggle(classifyProducts)}
					/>
					<span class="label-text text-sm text-wrap">{$_('preferences.classify_products')}</span>
				</label>
			</div>

			<div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mb-4">
				<button 
					class="btn md:btn-sm btn-primary btn-xs"
					onclick={resetToDefaults}
				>
					{$_('preferences.use_default')}
				</button>
				<span class="text-sm ml-2">{$_('preferences.default_description')}</span>
			</div>
		{/if}

		<!-- Preference Sections -->
		<PreferenceSection
			title={$_('preferences.sections.nutritional_quality')}
			options={nutritionalQualityOptions}
			expanded={nutritionalQualityExpanded}
			onToggle={() => nutritionalQualityExpanded = !nutritionalQualityExpanded}
			getValue={(id) => getValueFromCategory('nutritionalQuality', id)}
			onChange={handlePreferenceChange}
			category="nutritionalQuality"
		/>

		<PreferenceSection
			title={$_('preferences.sections.food_processing')}
			options={foodProcessingOptions}
			expanded={foodProcessingExpanded}
			onToggle={() => foodProcessingExpanded = !foodProcessingExpanded}
			getValue={(id) => getValueFromCategory('foodProcessing', id)}
			onChange={handlePreferenceChange}
			category="foodProcessing"
		/>

		<PreferenceSection
			title={$_('preferences.sections.allergens')}
			options={allergenOptions}
			expanded={allergensExpanded}
			onToggle={() => allergensExpanded = !allergensExpanded}
			getValue={(id) => getValueFromCategory('allergens', id)}
			onChange={handlePreferenceChange}
			category="allergens"
			showWarning={true}
			warningText={$_('preferences.allergens.warning')}
		/>

		<PreferenceSection
			title={$_('preferences.sections.ingredients')}
			options={ingredientOptions}
			expanded={ingredientsExpanded}
			onToggle={() => ingredientsExpanded = !ingredientsExpanded}
			getValue={(id) => getValueFromCategory('ingredients', id)}
			onChange={handlePreferenceChange}
			category="ingredients"
		/>

		<PreferenceSection
			title={$_('preferences.sections.labels')}
			options={labelOptions}
			expanded={labelsExpanded}
			onToggle={() => labelsExpanded = !labelsExpanded}
			getValue={(id) => getValueFromCategory('labels', id)}
			onChange={handlePreferenceChange}
			category="labels"
		/>

		<PreferenceSection
			title={$_('preferences.sections.environment')}
			options={environmentOptions}
			expanded={environmentExpanded}
			onToggle={() => environmentExpanded = !environmentExpanded}
			getValue={(id) => getValueFromCategory('environment', id)}
			onChange={handlePreferenceChange}
			category="environment"
		/>

		<!-- Close Button -->
		<div class="flex justify-end pt-4 border-t border-base-300">
			<button class="btn btn-primary" onclick={onClose}>
				{$_('preferences.close')}
			</button>
		</div>
	</div>
</Card>
