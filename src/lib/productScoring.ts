import { calculateScore, type ScoreData, type ProductAttributeGroup } from '$lib/scoring';
import type { UserPreference } from '$lib/stores/preferencesStore';

export interface ProductWithAttributes {
	[key: string]: unknown;
	attributes?: unknown[];
	code?: string;
}

export interface ScoredProduct {
	score: number;
	matchStatus: string;
	scoreData: ScoreData;
	[key: string]: unknown;
}

/**
 * Calculates scores for products based on user preferences
 * @param products - Array of products with attributes
 * @param userPreferences - Current user preferences for scoring
 * @returns Array of products with scores added
 */
export function scoreProducts<T extends ProductWithAttributes>(
	products: T[],
	userPreferences: UserPreference[]
): (T & ScoredProduct)[] {
	if (!products || products.length === 0) {
		return [];
	}

	return products.map((product) => {
		const productAttrs = (product.attributes || []) as ProductAttributeGroup[];
		const scoreData = calculateScore(productAttrs, userPreferences);
		return {
			...product,
			score: scoreData.score,
			matchStatus: scoreData.matchStatus,
			scoreData
		} as T & ScoredProduct;
	});
}

/**
 * Sorts scored products by their score
 * @param scoredProducts - Array of products that already have scores
 * @returns Array of products sorted by score
 */
export function sortScoredProducts<T extends ScoredProduct>(scoredProducts: T[]): T[] {
	return [...scoredProducts].sort((a, b) => {
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

/**
 * Personalizes search results by scoring and optionally sorting products based on user preferences
 * @param products - Array of products with attributes
 * @param userPreferences - Current user preferences for scoring
 * @param classifyEnabled - Whether classification/sorting is enabled
 * @returns Array of products with scores, optionally sorted
 */
export function personalizeSearchResults<T extends ProductWithAttributes>(
	products: T[],
	userPreferences: UserPreference[],
	classifyEnabled: boolean
): (T & ScoredProduct)[] {
	const scoredProducts = scoreProducts(products, userPreferences);

	if (classifyEnabled) {
		return sortScoredProducts(scoredProducts);
	}

	return scoredProducts;
}
