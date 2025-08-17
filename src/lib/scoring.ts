import type { UserPreference } from '$lib/stores/preferencesStore';
import { getPreferenceValue } from '$lib/stores/preferencesStore';
import type { Product } from '$lib/api/product';

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

export type ProductWithScore = Product & {
	score?: number;
	matchStatus?: MatchStatus;
	scoreData?: ScoreData;
};

export type ProductAttribute = {
	id: string;
	match?: number;
	status?: string;
};

export type ProductAttributeGroup = {
	id: string;
	attributes: ProductAttribute[];
};

// Preference importance weights
const PREF_WEIGHTS = {
	mandatory: 2,
	very_important: 2,
	important: 1,
	not_important: 0
} as const;

// Get weight for preference importance
const getWeight = (importance: string): number => {
	return PREF_WEIGHTS[importance as keyof typeof PREF_WEIGHTS] || 0;
};

export function calculateScore(
	productAttributes: ProductAttributeGroup[],
	currentPrefs: UserPreference[]
): ScoreData {
	let totalWeightedScore = 0;
	let totalWeights = 0;
	let hasMandatoryMismatch = false;
	let hasMandatoryUncertain = false;
	let unknownWeightSum = 0;

	for (const group of productAttributes) {
		for (const attr of group.attributes) {
			const prefValue = getPreferenceValue(currentPrefs, group.id, attr.id);
			const weight = getWeight(prefValue);

			if (weight > 0) {
				totalWeights += weight;

				// Calculate weighted score
				const match = attr.match || 0;
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

// Comparator function for sorting products by score and match status
export function compareProductsByScore<T extends ProductWithScore>(a: T, b: T): number {
	// Non-"does_not_match" products come first
	if (a.matchStatus === 'does_not_match' && b.matchStatus !== 'does_not_match') return 1;
	if (b.matchStatus === 'does_not_match' && a.matchStatus !== 'does_not_match') return -1;

	// Then by score (highest first)
	const scoreA = a.score || 0;
	const scoreB = b.score || 0;
	if (scoreB !== scoreA) return scoreB - scoreA;

	// Original order as tiebreaker (maintain existing order)
	return 0;
}
