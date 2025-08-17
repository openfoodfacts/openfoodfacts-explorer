import { calculateScore, type ProductAttributeGroup, type ProductWithScore } from '$lib/scoring';
import type { UserPreference } from '$lib/stores/preferencesStore';
import type { Product } from '$lib/api/product';
export type { ProductWithScore } from '$lib/scoring';

export type ProductWithAttributes<T = Product> = T & {
	attributes?: ProductAttributeGroup[];
};

/**
 * Calculates scores for products based on user preferences
 * @param products - Array of products with attributes
 * @param userPreferences - Current user preferences for scoring
 * @returns Array of products with scores added
 */
export function scoreProducts<T>(
	products: ProductWithAttributes<T>[],
	userPreferences: UserPreference[]
): (ProductWithAttributes<T> & ProductWithScore)[] {
	return products.map((product) => {
		const productAttrs = (product.attributes || []) as ProductAttributeGroup[];
		const scoreData = calculateScore(productAttrs, userPreferences);
		return {
			...product,
			score: scoreData.score,
			matchStatus: scoreData.matchStatus,
			scoreData
		} as ProductWithAttributes<T> & ProductWithScore;
	});
}

/**
 * Comparator function for sorting products by their match score and status
 * @param a - First product to compare
 * @param b - Second product to compare
 * @returns Number indicating sort order (-1, 0, 1)
 */
export function byMatchScore<T extends ProductWithScore>(a: T, b: T): number {
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

/**
 * Personalizes search results by scoring and optionally sorting products based on user preferences
 * @param products - Array of products with attributes
 * @param userPreferences - Current user preferences for scoring
 * @param classifyEnabled - Whether classification/sorting is enabled
 * @returns Array of products with scores, optionally sorted
 */
export function personalizeSearchResults<T>(
	products: ProductWithAttributes<T>[],
	userPreferences: UserPreference[],
	classifyEnabled: boolean
): (ProductWithAttributes<T> & ProductWithScore)[] {
	const scoredProducts = scoreProducts(products, userPreferences);

	if (classifyEnabled) {
		return scoredProducts.sort(byMatchScore);
	}

	return scoredProducts;
}
