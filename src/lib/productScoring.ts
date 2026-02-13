import { calculateScore, type ScoreData, type MatchStatus } from '$lib/scoring';
import type { ProductAttributeForScoringGroup } from '$lib/api/product';
import type { UserPreference } from '$lib/stores/preferencesStore';
import type { Product } from '$lib/api/product';

export type ProductWithAttributes<T = Product> = {
	product: T;
	attributes?: ProductAttributeForScoringGroup[];
};

export type ScoredProduct<T = Product> = {
	product: ProductWithAttributes<T>;
	score: number;
	matchStatus: MatchStatus;
	scoreData: ScoreData;
};

/**
 * Calculates the score and match status for a single product based on user preferences
 * @param product - Product with attributes to be scored
 * @param userPreferences - Current user preferences for scoring
 * @returns Scored product with score and match status
 */
export function scoreProduct<T>(
	product: ProductWithAttributes<T>,
	userPreferences: UserPreference[]
): ScoredProduct<T> {
	const productAttrs = (product.attributes || []) as ProductAttributeForScoringGroup[];
	const scoreData = calculateScore(productAttrs, userPreferences);
	return {
		product,
		score: scoreData.score,
		matchStatus: scoreData.matchStatus,
		scoreData
	};
}

/**
 * Comparator function for sorting products by their match score and status
 * @param a - First scored product to compare
 * @param b - Second scored product to compare
 * @returns Number indicating sort order (-1, 0, 1)
 */
export function byMatchScore<T>(a: ScoredProduct<T>, b: ScoredProduct<T>): number {
	// Non-"does_not_match" products come first
	if (a.matchStatus === 'does_not_match' && b.matchStatus !== 'does_not_match') return 1;
	if (b.matchStatus === 'does_not_match' && a.matchStatus !== 'does_not_match') return -1;

	// Then by score (highest first)
	if (b.score !== a.score) return (b.score ?? 0) - (a.score ?? 0);

	// Original order as tiebreaker (maintain existing order)
	return 0;
}

/**
 * Personalizes search results by scoring and optionally sorting products based on user preferences
 * @param products - Array of products with attributes
 * @param userPreferences - Current user preferences for scoring
 * @param classifyEnabled - Whether classification/sorting is enabled
 * @returns Array of scored products, optionally sorted
 */
export function personalizeSearchResults<T>(
	products: ProductWithAttributes<T>[],
	userPreferences: UserPreference[],
	classifyEnabled: boolean
): ScoredProduct<T>[] {
	const scoredProducts = products.map((product) => scoreProduct(product, userPreferences));

	if (classifyEnabled) {
		return scoredProducts.sort(byMatchScore);
	}

	return scoredProducts;
}
