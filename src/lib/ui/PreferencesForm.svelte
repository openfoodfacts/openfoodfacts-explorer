<script lang="ts">
	import { _ } from '$lib/i18n';
	import Card from './Card.svelte';
	import PreferenceSection from './PreferenceSection.svelte';
	import {
		userPreferences,
		attributeGroups,
		updatePreference,
		resetToDefaults,
		type UserPreferences
	} from '$lib/stores/preferencesStore';

	type PreferencesFormProps = {
		onPreferenceChange?: (category: string, preference: string, value: string) => void;
		showClassifyToggle?: boolean;
		classifyProducts?: boolean;
		onClassifyToggle?: (value: boolean) => void;
		onClose?: () => void;
	};

	let {
		onPreferenceChange = () => {},
		showClassifyToggle = true,
		classifyProducts = false,
		onClassifyToggle = () => {},
		onClose = () => {}
	}: PreferencesFormProps = $props();

	function handlePreferenceChange(category: string, preference: string, value: string) {
		updatePreference(category as keyof UserPreferences, preference, value);
		onPreferenceChange(category, preference, value);
	}

	function handleResetToDefaults() {
		resetToDefaults(onPreferenceChange);
	}

	let nutritionalQualityExpanded = $state(true);
	let foodProcessingExpanded = $state(true);
	let allergensExpanded = $state(true);
	let ingredientsExpanded = $state(true);
	let labelsExpanded = $state(true);
	let environmentExpanded = $state(true);

	// Create options based on attribute values
	const createOptionsFromAttribute = (groupId: string, attributeId: string) => {
		const group = attributeGroups.find((g) => g.id === groupId);
		const attribute = group?.attributes.find((attr) => attr.id === attributeId);
		const values = attribute?.values;
		if (!values) {
			console.warn(`No values found for attribute ${attributeId} in group ${groupId}`);
			return [];
		}
		return values.map((value) => ({
			value,
			label: $_(`preferences.options.${value}`) || value
		}));
	};

	// Preference options configuration
	const nutritionalQualityOptions = $derived([
		{
			id: 'nutriScore',
			label: $_('preferences.nutritional_quality.nutri_score'),
			icon: 'nutri-score',
			iconImg: 'nutriscore-a.svg',
			iconColor: 'bg-gradient-to-r from-red-500 via-yellow-500 to-green-500',
			options: createOptionsFromAttribute('nutritional_quality', 'nutriscore')
		},
		{
			id: 'saltInLowQuantity',
			label: $_('preferences.nutritional_quality.salt_low'),
			icon: 'salt',
			iconImg: 'nutrient-level-salt-low.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('nutritional_quality', 'low_salt')
		},
		{
			id: 'sugarsInLowQuantity',
			label: $_('preferences.nutritional_quality.sugars_low'),
			icon: 'sugar',
			iconImg: 'nutrient-level-sugars-low.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('nutritional_quality', 'low_sugars')
		},
		{
			id: 'fatInLowQuantity',
			label: $_('preferences.nutritional_quality.fat_low'),
			icon: 'fat',
			iconImg: 'nutrient-level-fat-low.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('nutritional_quality', 'low_fat')
		},
		{
			id: 'saturatedFatInLowQuantity',
			label: $_('preferences.nutritional_quality.saturated_fat_low'),
			icon: 'saturated-fat',
			iconImg: 'nutrient-level-saturated-fat-low.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('nutritional_quality', 'low_saturated_fat')
		}
	]);

	const foodProcessingOptions = $derived([
		{
			id: 'novaGroup',
			label: $_('preferences.food_processing.nova_group'),
			icon: 'nova',
			iconImg: 'nova-group-1.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('processing', 'nova')
		},
		{
			id: 'noOrFewAdditives',
			label: $_('preferences.food_processing.no_additives'),
			icon: 'additives',
			iconImg: '0-additives.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('processing', 'additives')
		}
	]);

	const allergenOptions = $derived([
		{
			id: 'withoutGluten',
			label: $_('preferences.allergens.without_gluten'),
			icon: 'gluten',
			iconImg: 'no-gluten.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('allergens', 'allergens_no_gluten')
		},
		{
			id: 'withoutMilk',
			label: $_('preferences.allergens.without_milk'),
			icon: 'milk',
			iconImg: 'no-milk.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('allergens', 'allergens_no_milk')
		},
		{
			id: 'withoutEggs',
			label: $_('preferences.allergens.without_eggs'),
			icon: 'eggs',
			iconImg: 'no-eggs.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('allergens', 'allergens_no_eggs')
		},
		{
			id: 'withoutNuts',
			label: $_('preferences.allergens.without_nuts'),
			icon: 'nuts',
			iconImg: 'no-nuts.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('allergens', 'allergens_no_nuts')
		},
		{
			id: 'withoutPeanuts',
			label: $_('preferences.allergens.without_peanuts'),
			icon: 'peanuts',
			iconImg: 'no-peanuts.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('allergens', 'allergens_no_peanuts')
		},
		{
			id: 'withoutSesameSeeds',
			label: $_('preferences.allergens.without_sesame'),
			icon: 'sesame',
			iconImg: 'no-sesame-seeds.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('allergens', 'allergens_no_sesame_seeds')
		},
		{
			id: 'withoutSoybeans',
			label: $_('preferences.allergens.without_soybeans'),
			icon: 'soybeans',
			iconImg: 'no-soybeans.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('allergens', 'allergens_no_soybeans')
		},
		{
			id: 'withoutCelery',
			label: $_('preferences.allergens.without_celery'),
			icon: 'celery',
			iconImg: 'no-celery.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('allergens', 'allergens_no_celery')
		},
		{
			id: 'withoutMustard',
			label: $_('preferences.allergens.without_mustard'),
			icon: 'mustard',
			iconImg: 'no-mustard.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('allergens', 'allergens_no_mustard')
		},
		{
			id: 'withoutLupin',
			label: $_('preferences.allergens.without_lupin'),
			icon: 'lupin',
			iconImg: 'no-lupin.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('allergens', 'allergens_no_lupin')
		},
		{
			id: 'withoutFish',
			label: $_('preferences.allergens.without_fish'),
			icon: 'fish',
			iconImg: 'no-fish.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('allergens', 'allergens_no_fish')
		},
		{
			id: 'withoutCrustaceans',
			label: $_('preferences.allergens.without_crustaceans'),
			icon: 'crustaceans',
			iconImg: 'no-crustaceans.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('allergens', 'allergens_no_crustaceans')
		},
		{
			id: 'withoutMolluscs',
			label: $_('preferences.allergens.without_molluscs'),
			icon: 'molluscs',
			iconImg: 'no-molluscs.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('allergens', 'allergens_no_molluscs')
		},
		{
			id: 'withoutSulphurDioxideAndSulphites',
			label: $_('preferences.allergens.without_sulphites'),
			icon: 'sulphites',
			iconImg: 'no-sulphur-dioxide-and-sulphites.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('allergens', 'allergens_no_sulphur_dioxide_and_sulphites')
		}
	]);

	const ingredientOptions = $derived([
		{
			id: 'vegan',
			label: $_('preferences.ingredients.vegan'),
			icon: 'vegan',
			iconImg: 'vegan.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('ingredients_analysis', 'vegan')
		},
		{
			id: 'vegetarian',
			label: $_('preferences.ingredients.vegetarian'),
			icon: 'vegetarian',
			iconImg: 'vegetarian.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('ingredients_analysis', 'vegetarian')
		},
		{
			id: 'palmOilFree',
			label: $_('preferences.ingredients.palm_oil_free'),
			icon: 'palm-oil-free',
			iconImg: 'palm-oil-free.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('ingredients_analysis', 'palm_oil_free')
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
			options: createOptionsFromAttribute('labels', 'labels_organic')
		},
		{
			id: 'fairTrade',
			label: $_('preferences.labels.fair_trade'),
			icon: 'fair-trade',
			iconImg: 'fair-trade.svg',
			iconColor: 'bg-blue-600',
			description: $_('preferences.labels.fair_trade_description'),
			options: createOptionsFromAttribute('labels', 'labels_fair_trade')
		}
	]);

	const environmentOptions = $derived([
		{
			id: 'lowEnvironmentalImpact',
			label: $_('preferences.environment.low_impact'),
			icon: 'green-score',
			iconImg: 'green-score-a.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('environment', 'ecoscore')
		},
		{
			id: 'lowRiskOfDeforestation',
			label: $_('preferences.environment.low_deforestation'),
			icon: 'forest',
			iconImg: 'forest-footprint-a.svg',
			iconColor: 'bg-green-600',
			options: createOptionsFromAttribute('environment', 'forest_footprint')
		}
	]);

	// Helper to get warning text from attribute groups
	const getWarningText = (groupId: string): string => {
		const group = attributeGroups.find((g) => g.id === groupId);
		return group?.warning || '';
	};

	// Section configurations for cleaner template
	const sections = $derived([
		{
			id: 'nutritionalQuality',
			title: $_('preferences.sections.nutritional_quality'),
			options: nutritionalQualityOptions,
			expanded: nutritionalQualityExpanded,
			toggleExpanded: () => (nutritionalQualityExpanded = !nutritionalQualityExpanded)
		},
		{
			id: 'foodProcessing',
			title: $_('preferences.sections.food_processing'),
			options: foodProcessingOptions,
			expanded: foodProcessingExpanded,
			toggleExpanded: () => (foodProcessingExpanded = !foodProcessingExpanded)
		},
		{
			id: 'allergens',
			title: $_('preferences.sections.allergens'),
			options: allergenOptions,
			expanded: allergensExpanded,
			toggleExpanded: () => (allergensExpanded = !allergensExpanded),
			showWarning: true,
			warningText: getWarningText('allergens')
		},
		{
			id: 'ingredients',
			title: $_('preferences.sections.ingredients'),
			options: ingredientOptions,
			expanded: ingredientsExpanded,
			toggleExpanded: () => (ingredientsExpanded = !ingredientsExpanded)
		},
		{
			id: 'labels',
			title: $_('preferences.sections.labels'),
			options: labelOptions,
			expanded: labelsExpanded,
			toggleExpanded: () => (labelsExpanded = !labelsExpanded)
		},
		{
			id: 'environment',
			title: $_('preferences.sections.environment'),
			options: environmentOptions,
			expanded: environmentExpanded,
			toggleExpanded: () => (environmentExpanded = !environmentExpanded)
		}
	]);

	// Value getters
	const getValueFromCategory = (category: keyof UserPreferences, id: string) => {
		return $userPreferences[category][id as keyof (typeof $userPreferences)[typeof category]];
	};
</script>

<Card>
	<div class="space-y-6">
		<!-- Header -->
		<div class="mb-6">
			<h2 class="text-base-content mb-2 text-xl font-semibold">{$_('preferences.title')}</h2>
			<p class="text-base-content/70 text-sm">
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

			<div class="mb-4 rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
				<button class="btn md:btn-sm btn-primary btn-xs" onclick={handleResetToDefaults}>
					{$_('preferences.use_default')}
				</button>
				<span class="ml-2 text-sm">{$_('preferences.default_description')}</span>
			</div>
		{/if}

		<!-- Preference Sections -->
		{#each sections as section}
			<PreferenceSection
				title={section.title}
				options={section.options}
				expanded={section.expanded}
				onToggle={section.toggleExpanded}
				getValue={(id) => getValueFromCategory(section.id as keyof UserPreferences, id)}
				onChange={handlePreferenceChange}
				category={section.id}
				showWarning={section.showWarning}
				warningText={section.warningText}
			/>
		{/each}

		<!-- Close Button -->
		<div class="border-base-300 flex justify-end border-t pt-4">
			<button class="btn btn-primary" onclick={onClose}>
				{$_('preferences.close')}
			</button>
		</div>
	</div>
</Card>
