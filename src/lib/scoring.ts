export type ScoreData = {
	score: number;
	matchStatus: string;
	totalWeights: number;
	totalWeightedScore: number;
};

// @ts-expect-error: userPreferences may not have group.id as a key, but we handle it safely
export const calculateScore = (productAttributes, currentPrefs): ScoreData => {
	
	let totalWeightedScore = 0;
	let totalWeights = 0;
	let hasMandatoryMismatch = false;
	let hasMandatoryUncertain = false;
	let unknownWeightSum = 0;

	// Preference weights
	const getWeight = (importance: string): number => {
		switch (importance) {
			case 'mandatory': return 2;
			case 'very_important': return 2;
			case 'important': return 1;
			case 'not_important': return 0;
			default: return 0;
		}
	};

	for (const group of productAttributes) {
		for (const attr of group.attributes) {
			const prefValue = currentPrefs[group.id]?.[attr.id] || 'not_important';
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
	const normalizedScore = totalWeights > 0 ? Math.round((totalWeightedScore / totalWeights) / 100 * 100) : 0;
	
	let matchStatus = 'unknown_match';
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
};

export interface ProductWithScore {
	score?: number;
	matchStatus?: string;
	scoreData?: ScoreData;
	[key: string]: unknown;
}

// Sort products by score using the ranking algorithm
export function sortProductsByScore<T extends ProductWithScore>(products: T[]): T[] {
	return [...products].sort((a, b) => {
		// Non-"does_not_match" products come first
		if (a.matchStatus === 'does_not_match' && b.matchStatus !== 'does_not_match') return 1;
		if (b.matchStatus === 'does_not_match' && a.matchStatus !== 'does_not_match') return -1;
		
		// Then by score (highest first)
		const scoreA = a.score || 0;
		const scoreB = b.score || 0;
		if (scoreB !== scoreA) return scoreB - scoreA;
		
		// Original order as tiebreaker (maintain existing order)
		return 0;
	});
}
