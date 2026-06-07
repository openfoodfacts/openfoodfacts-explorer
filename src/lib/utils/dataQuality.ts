export interface QualityError {
	tag: string;
	field: string; // e.g., 'sugars_100g', 'energy_100g', 'categories'
	section: string; // e.g., 'nutrition', 'basic-info'
	message: string; // Translation key for localized error message
	severity: 'warning' | 'error' | 'info';
}

export const QUALITY_ERRORS_MAP: Record<string, Omit<QualityError, 'tag'>> = {
	'en:nutrition-sugars-plus-starch-greater-than-carbohydrates': {
		field: 'sugars_100g',
		section: 'nutrition',
		message: 'product.edit.quality.sugars_gt_carbs',
		severity: 'error'
	},
	'en:nutrition-energy-value-in-kcal-does-not-match-value-in-kj': {
		field: 'energy_100g',
		section: 'nutrition',
		message: 'product.edit.quality.energy_kcal_kj_mismatch',
		severity: 'warning'
	},
	'en:nutrition-saturated-fat-greater-than-fat': {
		field: 'saturated-fat_100g',
		section: 'nutrition',
		message: 'product.edit.quality.fat_lt_saturated',
		severity: 'error'
	},
	'en:nutrition-sodium-salt-miscalculated': {
		field: 'salt_100g',
		section: 'nutrition',
		message: 'product.edit.quality.salt_sodium_mismatch',
		severity: 'warning'
	},
	'en:serving-size-is-missing-digits': {
		field: 'serving_size',
		section: 'nutrition',
		message: 'product.edit.quality.serving_size_missing_digits',
		severity: 'error'
	},
	'en:nutrition-data-per-serving-missing-serving-size': {
		field: 'serving_size',
		section: 'nutrition',
		message: 'product.edit.quality.missing_serving_size',
		severity: 'error'
	},
	'en:nutrition-data-per-serving-serving-quantity-is-0': {
		field: 'serving_size',
		section: 'nutrition',
		message: 'product.edit.quality.serving_quantity_zero',
		severity: 'error'
	},
	'en:quantity-not-recognized': {
		field: 'quantity',
		section: 'basic-info',
		message: 'product.edit.quality.quantity_not_recognized',
		severity: 'warning'
	},
	'en:product-quantity-over-30kg': {
		field: 'quantity',
		section: 'basic-info',
		message: 'product.edit.quality.quantity_over_30kg',
		severity: 'error'
	},
	'en:product-quantity-under-1g': {
		field: 'quantity',
		section: 'basic-info',
		message: 'product.edit.quality.quantity_under_1g',
		severity: 'warning'
	},
	'en:serving-quantity-over-500g': {
		field: 'serving_size',
		section: 'nutrition',
		message: 'product.edit.quality.serving_over_500g',
		severity: 'warning'
	},
	'en:serving-quantity-under-1g': {
		field: 'serving_size',
		section: 'nutrition',
		message: 'product.edit.quality.serving_under_1g',
		severity: 'warning'
	},
	'en:serving-quantity-over-product-quantity': {
		field: 'serving_size',
		section: 'nutrition',
		message: 'product.edit.quality.serving_over_product_quantity',
		severity: 'warning'
	},
	'en:organic-ingredients-but-no-organic-label': {
		field: 'labels',
		section: 'basic-info',
		message: 'product.edit.quality.organic_but_no_label',
		severity: 'warning'
	},
	'en:ingredients-over-30-percent-digits': {
		field: 'ingredients_text',
		section: 'ingredients',
		message: 'product.edit.quality.ingredients_too_many_digits',
		severity: 'warning'
	},
	'en:ingredients-ending-comma': {
		field: 'ingredients_text',
		section: 'ingredients',
		message: 'product.edit.quality.ingredients_ending_comma',
		severity: 'warning'
	},
	'en:ingredients-5-consonants': {
		field: 'ingredients_text',
		section: 'ingredients',
		message: 'product.edit.quality.ingredients_consonants_mismatch',
		severity: 'warning'
	},
	'en:ingredients-4-repeated-chars': {
		field: 'ingredients_text',
		section: 'ingredients',
		message: 'product.edit.quality.ingredients_repeated_chars',
		severity: 'warning'
	},
	'en:nutrition-energy-value-in-kj-does-not-match-value-computed-from-other-nutrients': {
		field: 'energy_100g',
		section: 'nutrition',
		message: 'product.edit.quality.energy_kj_computed_mismatch',
		severity: 'error'
	},
	'en:nutrition-energy-value-in-kcal-does-not-match-value-computed-from-other-nutrients': {
		field: 'energy_100g',
		section: 'nutrition',
		message: 'product.edit.quality.energy_kcal_computed_mismatch',
		severity: 'error'
	},
	'en:nutrition-energy-value-in-kj-may-not-match-value-computed-from-other-nutrients': {
		field: 'energy_100g',
		section: 'nutrition',
		message: 'product.edit.quality.energy_kj_computed_warning',
		severity: 'warning'
	},
	'en:nutrition-energy-value-in-kcal-may-not-match-value-computed-from-other-nutrients': {
		field: 'energy_100g',
		section: 'nutrition',
		message: 'product.edit.quality.energy_kcal_computed_warning',
		severity: 'warning'
	},
	'en:nutrition-data-prepared-without-category-dried-products-to-be-rehydrated': {
		field: 'categories',
		section: 'basic-info',
		message: 'product.edit.quality.prepared_without_dried_category',
		severity: 'warning'
	},
	'en:missing-nutrition-data-prepared-with-category-dried-products-to-be-rehydrated': {
		field: 'categories',
		section: 'basic-info',
		message: 'product.edit.quality.missing_prepared_with_dried_category',
		severity: 'warning'
	},
	'en:nutri-score-grade-from-category-does-not-match-calculated-grade': {
		field: 'categories',
		section: 'basic-info',
		message: 'product.edit.quality.nutriscore_grade_category_mismatch',
		severity: 'error'
	},
	'en:alcoholic-beverages-category-without-alcohol-value': {
		field: 'categories',
		section: 'basic-info',
		message: 'product.edit.quality.alcoholic_beverages_without_alcohol',
		severity: 'warning'
	},
	'en:alcoholic-and-non-alcoholic-categories': {
		field: 'categories',
		section: 'basic-info',
		message: 'product.edit.quality.alcoholic_and_non_alcoholic_conflict',
		severity: 'warning'
	},
	'en:alcohol-value-without-alcoholic-beverages-category': {
		field: 'categories',
		section: 'basic-info',
		message: 'product.edit.quality.alcohol_without_alcoholic_category',
		severity: 'warning'
	},
	'en:incompatible-categories-plant-milk-and-dairy': {
		field: 'categories',
		section: 'basic-info',
		message: 'product.edit.quality.incompatible_plant_milk_dairy',
		severity: 'warning'
	},
	'en:serving-quantity-less-than-product-quantity-divided-by-1000': {
		field: 'serving_size',
		section: 'nutrition',
		message: 'product.edit.quality.serving_too_small_relative_to_product',
		severity: 'warning'
	},
	'en:serving-quantity-defined-but-quantity-undefined': {
		field: 'serving_size',
		section: 'nutrition',
		message: 'product.edit.quality.serving_defined_but_quantity_undefined',
		severity: 'warning'
	},
	'en:serving-size-in-mg': {
		field: 'serving_size',
		section: 'nutrition',
		message: 'product.edit.quality.serving_size_in_mg',
		severity: 'warning'
	},
	'en:nutrition-data-per-serving-serving-quantity-is-not-recognized': {
		field: 'serving_size',
		section: 'nutrition',
		message: 'product.edit.quality.serving_quantity_not_recognized',
		severity: 'warning'
	},
	'en:product-quantity-over-10kg': {
		field: 'quantity',
		section: 'basic-info',
		message: 'product.edit.quality.quantity_over_10kg',
		severity: 'warning'
	},
	'en:product-quantity-in-mg': {
		field: 'quantity',
		section: 'basic-info',
		message: 'product.edit.quality.quantity_in_mg',
		severity: 'warning'
	},
	'en:quantity-contains-e': {
		field: 'quantity',
		section: 'basic-info',
		message: 'product.edit.quality.quantity_contains_e',
		severity: 'info'
	},
	'en:nutrition-energy-value-in-kcal-greater-than-in-kj': {
		field: 'energy_100g',
		section: 'nutrition',
		message: 'product.edit.quality.energy_kcal_gt_kj',
		severity: 'error'
	},
	'en:nutrition-energy-value-in-kcal-and-kj-are-reversed': {
		field: 'energy_100g',
		section: 'nutrition',
		message: 'product.edit.quality.energy_kcal_kj_reversed',
		severity: 'error'
	},
	'en:nutrition-value-over-3911-energy': {
		field: 'energy_100g',
		section: 'nutrition',
		message: 'product.edit.quality.energy_over_3911',
		severity: 'error'
	},
	'en:nutrition-value-total-over-105': {
		field: 'nutrition_data_per',
		section: 'nutrition',
		message: 'product.edit.quality.nutrition_total_over_105',
		severity: 'error'
	},
	'en:nutrition-sugars-plus-starch-plus-fiber-greater-than-carbohydrates-total': {
		field: 'carbohydrates_100g',
		section: 'nutrition',
		message: 'product.edit.quality.sugars_starch_fiber_gt_carbs',
		severity: 'error'
	},
	'en:nutrition-value-under-0-01-g-salt': {
		field: 'salt_100g',
		section: 'nutrition',
		message: 'product.edit.quality.salt_under_0_01g',
		severity: 'warning'
	},
	'en:nutrition-value-under-0-001-g-salt': {
		field: 'salt_100g',
		section: 'nutrition',
		message: 'product.edit.quality.salt_under_0_001g',
		severity: 'warning'
	},
	'en:nutrition-3-or-more-values-are-identical': {
		field: 'nutrition_data_per',
		section: 'nutrition',
		message: 'product.edit.quality.identical_values_warning',
		severity: 'warning'
	},
	'en:nutrition-values-are-all-identical': {
		field: 'nutrition_data_per',
		section: 'nutrition',
		message: 'product.edit.quality.identical_values_error',
		severity: 'error'
	},
	'en:vegan-label-but-non-vegan-ingredient': {
		field: 'labels',
		section: 'basic-info',
		message: 'product.edit.quality.vegan_label_non_vegan_ingredient',
		severity: 'warning'
	},
	'en:low-energy-label-claim-but-energy-above-limitation': {
		field: 'labels',
		section: 'basic-info',
		message: 'product.edit.quality.low_energy_claim_conflict',
		severity: 'warning'
	},
	'en:low-fat-label-claim-but-fat-above-limitation': {
		field: 'labels',
		section: 'basic-info',
		message: 'product.edit.quality.low_fat_claim_conflict',
		severity: 'warning'
	},
	'en:no-fat-label-claim-but-fat-above-0.5': {
		field: 'labels',
		section: 'basic-info',
		message: 'product.edit.quality.no_fat_claim_conflict',
		severity: 'warning'
	},
	'en:saturated-fat-free-label-claim-but-fat-above-0.1': {
		field: 'labels',
		section: 'basic-info',
		message: 'product.edit.quality.saturated_fat_free_claim_conflict',
		severity: 'warning'
	},
	'en:low-sugar-label-claim-but-sugar-above-limitation': {
		field: 'labels',
		section: 'basic-info',
		message: 'product.edit.quality.low_sugar_claim_conflict',
		severity: 'warning'
	},
	'en:sugar-free-label-claim-but-sugar-above-limitation': {
		field: 'labels',
		section: 'basic-info',
		message: 'product.edit.quality.sugar_free_claim_conflict',
		severity: 'warning'
	},
	'en:no-added-sugar-label-claim-but-contains-added-sugar': {
		field: 'labels',
		section: 'basic-info',
		message: 'product.edit.quality.no_added_sugar_claim_conflict',
		severity: 'warning'
	},
	'en:high-fibres-label-claim-but-fibre-below-limitation': {
		field: 'labels',
		section: 'basic-info',
		message: 'product.edit.quality.high_fibers_claim_conflict',
		severity: 'warning'
	},
	'en:ingredients-missing-specific-ingredient-for-this-category': {
		field: 'ingredients_text',
		section: 'ingredients',
		message: 'product.edit.quality.missing_specific_ingredient',
		severity: 'warning'
	}
};

export function getQualityErrors(
	errors?: string[],
	warnings?: string[],
	infos?: string[]
): QualityError[] {
	const result: QualityError[] = [];

	const processList = (
		tags: string[] | undefined,
		defaultSeverity: 'error' | 'warning' | 'info'
	) => {
		if (!tags) return;
		for (const tag of tags) {
			// Try direct exact match first
			const mapped = QUALITY_ERRORS_MAP[tag];
			if (mapped) {
				result.push({
					tag,
					...mapped,
					severity: defaultSeverity
				});
				continue;
			}

			// Fallback to dynamic negative nutrient value matches
			const negativeMatch = tag.match(/value-negative-([a-zA-Z0-9-]+)$/);
			if (negativeMatch) {
				const nutrient = negativeMatch[1];
				result.push({
					tag,
					field: nutrient.replace(/-/g, '_') + '_100g',
					section: 'nutrition',
					message: 'product.edit.quality.value_negative',
					severity: defaultSeverity
				});
				continue;
			}

			// Fallback to dynamic nutrient over-limit (105g/ml) matches
			const over105Match = tag.match(/value-over-105-([a-zA-Z0-9-]+)$/);
			if (over105Match) {
				const nutrient = over105Match[1];
				result.push({
					tag,
					field: nutrient.replace(/-/g, '_') + '_100g',
					section: 'nutrition',
					message: 'product.edit.quality.value_over_105',
					severity: defaultSeverity
				});
				continue;
			}

			// Fallback to dynamic nutrient extreme value (1000) matches
			const over1000Match = tag.match(/value-over-1000-([a-zA-Z0-9-]+)$/);
			if (over1000Match) {
				const nutrient = over1000Match[1];
				result.push({
					tag,
					field: nutrient.replace(/-/g, '_') + '_100g',
					section: 'nutrition',
					message: 'product.edit.quality.value_over_1000',
					severity: defaultSeverity
				});
				continue;
			}

			// Fallback to suffix matching to handle dynamic input set IDs or language prefixes
			let suffixMatched = false;
			for (const [key, value] of Object.entries(QUALITY_ERRORS_MAP)) {
				const suffix = key.replace(/^en:(nutrition|ingredients)-/, '');
				if (tag.endsWith(suffix)) {
					result.push({
						tag,
						...value,
						severity: defaultSeverity
					});
					suffixMatched = true;
					break;
				}
			}
			if (suffixMatched) continue;
		}
	};

	processList(errors, 'error');
	processList(warnings, 'warning');
	processList(infos, 'info');

	return result;
}
