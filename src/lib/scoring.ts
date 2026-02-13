import type { UserPreference } from '$lib/stores/preferencesStore';
import { getAttributePreferenceValue } from '$lib/stores/preferencesStore';
import type { ProductAttributeForScoringGroup } from '$lib/api/product';

export type MatchStatus =
	| 'unknown_match'
	| 'does_not_match'
	| 'may_not_match'
	| 'very_good_match'
	| 'good_match'
	| 'poor_match';

export type ScoreData = {
	score: number;
	matchStatus: MatchStatus;
	totalWeights: number;
	totalWeightedScore: number;
};

// Preference importance weights
const PREF_WEIGHTS = {
	mandatory: 2,
	very_important: 2,
	important: 1,
	not_important: 0
} as const;

// Get weight for preference importance
const getWeight = (importance: string): number =>
	PREF_WEIGHTS[importance as keyof typeof PREF_WEIGHTS] ?? 0;

// source of algorithm: https://github.com/openfoodfacts/openfoodfacts-server/blob/main/html/js/product-search.js
export function calculateScore(
	productAttributes: ProductAttributeForScoringGroup[],
	currentPrefs: UserPreference[]
): ScoreData {
	let totalWeightedScore = 0;
	let totalWeights = 0;
	let hasMandatoryMismatch = false;
	let hasMandatoryUncertain = false;
	let unknownWeightSum = 0;

	for (const group of productAttributes) {
		for (const attr of group.attributes) {
			const prefValue = getAttributePreferenceValue(currentPrefs, group.id, attr.id);
			const weight = getWeight(prefValue);

			if (weight > 0) {
				totalWeights += weight;

				// Calculate weighted score
				const match = attr.match ?? 0;
				totalWeightedScore += match * weight;

				// Check for mandatory mismatches and uncertainties
				if (prefValue === 'mandatory') {
					if (match <= 10) {
						hasMandatoryMismatch = true;
					} else if (match <= 50) {
						hasMandatoryUncertain = true;
					}
				}

				// Track unknown attributes
				if (attr.status === 'unknown') {
					unknownWeightSum += weight;
				}
			}
		}
	}

	// Normalize score to 0-100
	const normalizedScore = totalWeights > 0 ? Math.round(totalWeightedScore / totalWeights) : 0;

	let matchStatus: MatchStatus = 'unknown_match';
	const unknownRatio = totalWeights > 0 ? unknownWeightSum / totalWeights : 0;

	if (hasMandatoryMismatch) {
		matchStatus = 'does_not_match';
	} else if (hasMandatoryUncertain) {
		matchStatus = 'may_not_match';
	} else if (unknownRatio > 0.5) {
		matchStatus = 'unknown_match';
	} else if (normalizedScore >= 75) {
		matchStatus = 'very_good_match';
	} else if (normalizedScore >= 50) {
		matchStatus = 'good_match';
	} else {
		matchStatus = 'poor_match';
	}

	return {
		score: normalizedScore,
		matchStatus,
		totalWeights,
		totalWeightedScore
	};
}
