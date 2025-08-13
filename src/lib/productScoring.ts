import { calculateScore, sortProductsByScore, type ScoreData } from '$lib/scoring';

export interface ProductWithAttributes {
	[key: string]: unknown;
	attributes?: unknown[];
	code?: string;
}

export interface ScoredProduct extends ProductWithAttributes {
	score: number;
	matchStatus: string;
	scoreData: ScoreData;
}

/**
 * Calculates scores for products and sorts them based on classification preference
 * @param products - Array of products with attributes
 * @param userPreferences - Current user preferences for scoring
 * @param classifyEnabled - Whether classification/sorting is enabled
 * @returns Object containing scored products and sorted products
 */
export function scoreAndSortProducts<T extends ProductWithAttributes>(
	products: T[],
	userPreferences: Record<string, Record<string, string>>,
	classifyEnabled: boolean
): {
	scoredProducts: (T & ScoredProduct)[];
	sortedProducts: (T & ScoredProduct)[];
} {
	if (!products || products.length === 0) {
		return {
			scoredProducts: [],
			sortedProducts: []
		};
	}

	const productsWithScores = products.map((product) => {
		const productAttrs = product.attributes || [];
		const scoreData = calculateScore(productAttrs, userPreferences);
		return {
			...product,
			score: scoreData.score,
			matchStatus: scoreData.matchStatus,
			scoreData
		} as T & ScoredProduct;
	});

	let sortedProducts: (T & ScoredProduct)[];
	if (classifyEnabled) {
		sortedProducts = sortProductsByScore(productsWithScores);
	} else {
		sortedProducts = productsWithScores;
	}

	return {
		scoredProducts: productsWithScores,
		sortedProducts
	};
}
