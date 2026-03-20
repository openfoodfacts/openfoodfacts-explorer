import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	scoreProduct,
	byMatchScore,
	personalizeSearchResults,
	type ScoredProduct,
	type ProductWithAttributes
} from './productScoring';
import { calculateScore } from '$lib/scoring';
import type { UserPreference } from '$lib/stores/preferencesStore';
import type { MatchStatus } from '$lib/scoring';
import type { Product, ProductAttributeForScoringGroup } from '$lib/api/product';

vi.mock('$lib/scoring', () => ({
	calculateScore: vi.fn()
}));

const mockCalculateScore = vi.mocked(calculateScore);

describe('productScoring.ts utilities', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('scoreProduct', () => {
		it('should calculate score using calculateScore and return formatted object', () => {
			const product: ProductWithAttributes = {
				product: { _id: '123' } as unknown as Product,
				attributes: [
					{ id: 'group1', name: 'Group 1', attributes: [] }
				] as unknown as ProductAttributeForScoringGroup[]
			};
			const preferences: UserPreference[] = [];

			mockCalculateScore.mockReturnValue({
				score: 85,
				matchStatus: 'very_good_match',
				totalWeights: 2,
				totalWeightedScore: 170
			});

			const result = scoreProduct(product, preferences);

			expect(mockCalculateScore).toHaveBeenCalledWith(product.attributes, preferences);
			expect(result).toEqual({
				product,
				score: 85,
				matchStatus: 'very_good_match',
				scoreData: {
					score: 85,
					matchStatus: 'very_good_match',
					totalWeights: 2,
					totalWeightedScore: 170
				}
			});
		});

		it('should handle product with undefined attributes', () => {
			const product: ProductWithAttributes = {
				product: { _id: '123' } as unknown as Product
			};
			const preferences: UserPreference[] = [];

			mockCalculateScore.mockReturnValue({
				score: 0,
				matchStatus: 'unknown_match',
				totalWeights: 0,
				totalWeightedScore: 0
			});

			const result = scoreProduct(product, preferences);

			expect(mockCalculateScore).toHaveBeenCalledWith([], preferences);
			expect(result.score).toBe(0);
		});
	});

	describe('byMatchScore', () => {
		const createScoredProduct = (status: MatchStatus, score: number): ScoredProduct => ({
			product: { product: { _id: '1' } as unknown as Product },
			score,
			matchStatus: status,
			scoreData: { score, matchStatus: status, totalWeights: 1, totalWeightedScore: score }
		});

		it('should put "does_not_match" products at the end', () => {
			const doesNotMatch = createScoredProduct('does_not_match', 90);
			const goodMatch = createScoredProduct('good_match', 50);

			expect(byMatchScore(doesNotMatch, goodMatch)).toBe(1);
			expect(byMatchScore(goodMatch, doesNotMatch)).toBe(-1);
			expect(byMatchScore(doesNotMatch, doesNotMatch)).toBe(0);
		});

		it('should sort by score descending when both are not "does_not_match"', () => {
			const high = createScoredProduct('very_good_match', 90);
			const low = createScoredProduct('good_match', 60);

			expect(byMatchScore(high, low)).toBeLessThan(0);
			expect(byMatchScore(low, high)).toBeGreaterThan(0);
		});

		it('should sort by score descending even when both are "does_not_match"', () => {
			const highDoesNotMatch = createScoredProduct('does_not_match', 60);
			const lowDoesNotMatch = createScoredProduct('does_not_match', 20);

			expect(byMatchScore(highDoesNotMatch, lowDoesNotMatch)).toBeLessThan(0);
			expect(byMatchScore(lowDoesNotMatch, highDoesNotMatch)).toBeGreaterThan(0);
		});

		it('should return 0 when scores and match status are equal', () => {
			const a = createScoredProduct('good_match', 50);
			const b = createScoredProduct('good_match', 50);

			expect(byMatchScore(a, b)).toBe(0);
		});
	});

	describe('personalizeSearchResults', () => {
		const products: ProductWithAttributes[] = [
			{ product: { _id: '1' } as unknown as Product },
			{ product: { _id: '2' } as unknown as Product },
			{ product: { _id: '3' } as unknown as Product }
		];

		it('should score products and return them unsorted if classifyEnabled is false', () => {
			mockCalculateScore
				.mockReturnValueOnce({
					score: 50,
					matchStatus: 'good_match',
					totalWeights: 1,
					totalWeightedScore: 50
				})
				.mockReturnValueOnce({
					score: 90,
					matchStatus: 'very_good_match',
					totalWeights: 1,
					totalWeightedScore: 90
				})
				.mockReturnValueOnce({
					score: 20,
					matchStatus: 'does_not_match',
					totalWeights: 1,
					totalWeightedScore: 20
				});

			const result = personalizeSearchResults(products, [], false);

			expect(result).toHaveLength(3);
			expect(result[0].score).toBe(50);
			expect(result[1].score).toBe(90);
			expect(result[2].score).toBe(20);
		});

		it('should score and sort products if classifyEnabled is true', () => {
			mockCalculateScore
				.mockReturnValueOnce({
					score: 50,
					matchStatus: 'good_match',
					totalWeights: 1,
					totalWeightedScore: 50
				})
				.mockReturnValueOnce({
					score: 90,
					matchStatus: 'very_good_match',
					totalWeights: 1,
					totalWeightedScore: 90
				})
				.mockReturnValueOnce({
					score: 80,
					matchStatus: 'does_not_match',
					totalWeights: 1,
					totalWeightedScore: 80
				});

			const result = personalizeSearchResults(products, [], true);

			expect(result).toHaveLength(3);
			expect(result[0].score).toBe(90);
			expect(result[1].score).toBe(50);
			expect(result[2].score).toBe(80);
			expect(result[2].matchStatus).toBe('does_not_match');
		});
	});
});
