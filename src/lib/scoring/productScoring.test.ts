import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	scoreProduct,
	byMatchScore,
	personalizeSearchResults,
	type ProductWithAttributes,
	type ScoredProduct
} from '../productScoring';
import { calculateScore, type ScoreData } from '$lib/scoring';
import type { UserPreference } from '$lib/stores/preferencesStore';
import type { MatchStatus } from '$lib/scoring';

vi.mock('$lib/scoring', () => ({
	calculateScore: vi.fn()
}));

const makeScoreData = (
	score: number,
	matchStatus: MatchStatus,
	totalWeights = 1,
	totalWeightedScore = score
): ScoreData => ({
	score,
	matchStatus,
	totalWeights,
	totalWeightedScore
});

const mockUserPreferences = (prefs: Array<{ id: string }>): UserPreference[] =>
	prefs as UserPreference[];

const makeScoredProduct = (
	code: string,
	score: number,
	matchStatus: MatchStatus
): ScoredProduct<{ code: string }> => ({
	product: { product: { code } },
	score,
	matchStatus,
	scoreData: makeScoreData(score, matchStatus)
});

describe('productScoring', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('scoreProduct', () => {
		it('returns scored product using calculateScore result', () => {
			const scoreData = makeScoreData(12, 'good_match', 10, 120);
			vi.mocked(calculateScore).mockReturnValue(scoreData);

			const product = {
				product: { code: '123' },
				attributes: [{ id: 'a1' }]
			} as ProductWithAttributes<{ code: string }>;

			const userPreferences = mockUserPreferences([{ id: 'pref1' }]);

			const result = scoreProduct(product, userPreferences);

			expect(calculateScore).toHaveBeenCalledWith(product.attributes, userPreferences);
			expect(result).toEqual({
				product,
				score: 12,
				matchStatus: 'good_match',
				scoreData
			});
		});

		it('uses empty attributes array when product.attributes is undefined', () => {
			vi.mocked(calculateScore).mockReturnValue(makeScoreData(0, 'unknown_match', 0, 0));

			const product = {
				product: { code: '456' }
			} as ProductWithAttributes<{ code: string }>;

			scoreProduct(product, []);

			expect(calculateScore).toHaveBeenCalledWith([], []);
		});
	});

	describe('byMatchScore', () => {
		it('ranks products with better scores first', () => {
			const high = makeScoredProduct('high', 10, 'good_match');
			const low = makeScoredProduct('low', 4, 'good_match');

			expect(byMatchScore(high, low)).toBeLessThan(0);
			expect(byMatchScore(low, high)).toBeGreaterThan(0);
		});

		it('pushes does_not_match products lower', () => {
			const good = makeScoredProduct('good', 1, 'good_match');
			const doesNotMatch = makeScoredProduct('dnm', 100, 'does_not_match');

			expect(byMatchScore(good, doesNotMatch)).toBeLessThan(0);
			expect(byMatchScore(doesNotMatch, good)).toBeGreaterThan(0);
		});

		it('returns 0 for equal scores and same match status to preserve original order', () => {
			const a = makeScoredProduct('a', 5, 'good_match');
			const b = makeScoredProduct('b', 5, 'good_match');

			expect(byMatchScore(a, b)).toBe(0);
		});
	});

	describe('personalizeSearchResults', () => {
		it('ranks products with better match scores first', () => {
			vi.mocked(calculateScore)
				.mockReturnValueOnce(makeScoreData(2, 'poor_match', 2, 4))
				.mockReturnValueOnce(makeScoreData(9, 'very_good_match', 3, 27));

			const products = [
				{ product: { code: 'low' }, attributes: [] },
				{ product: { code: 'high' }, attributes: [] }
			];

			const result = personalizeSearchResults(products, [], true);

			expect(result.map((p) => p.product.product.code)).toEqual(['high', 'low']);
		});

		it('pushes does_not_match products lower', () => {
			vi.mocked(calculateScore)
				.mockReturnValueOnce(makeScoreData(10, 'does_not_match', 1, 10))
				.mockReturnValueOnce(makeScoreData(1, 'good_match', 1, 1));

			const products = [
				{ product: { code: 'bad' }, attributes: [] },
				{ product: { code: 'good' }, attributes: [] }
			];

			const result = personalizeSearchResults(products, [], true);

			expect(result.map((p) => p.product.product.code)).toEqual(['good', 'bad']);
		});

		it('preserves original order when scores are equal', () => {
			vi.mocked(calculateScore)
				.mockReturnValueOnce(makeScoreData(5, 'good_match', 1, 5))
				.mockReturnValueOnce(makeScoreData(5, 'good_match', 1, 5));

			const products = [
				{ product: { code: 'first' }, attributes: [] },
				{ product: { code: 'second' }, attributes: [] }
			];

			const result = personalizeSearchResults(products, [], true);

			expect(result.map((p) => p.product.product.code)).toEqual(['first', 'second']);
		});

		it('does not reorder results when classifyEnabled is false', () => {
			vi.mocked(calculateScore)
				.mockReturnValueOnce(makeScoreData(1, 'poor_match', 1, 1))
				.mockReturnValueOnce(makeScoreData(10, 'very_good_match', 1, 10));

			const products = [
				{ product: { code: 'first' }, attributes: [] },
				{ product: { code: 'second' }, attributes: [] }
			];

			const result = personalizeSearchResults(products, [], false);

			expect(result.map((p) => p.product.product.code)).toEqual(['first', 'second']);
		});

		it('returns empty array for empty input', () => {
			const result = personalizeSearchResults([], [], true);
			expect(result).toEqual([]);
		});
	});
});