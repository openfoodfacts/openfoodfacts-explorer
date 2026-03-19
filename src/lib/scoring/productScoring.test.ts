import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	scoreProduct,
	byMatchScore,
	personalizeSearchResults,
	type ProductWithAttributes
} from '../productScoring';
import { calculateScore } from '$lib/scoring';

vi.mock('$lib/scoring', () => ({
	calculateScore: vi.fn()
}));

describe('productScoring', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('scoreProduct', () => {
		it('returns scored product using calculateScore result', () => {
			vi.mocked(calculateScore).mockReturnValue({
				score: 12,
				matchStatus: 'match',
				matched: [],
				unmatched: [],
				doesNotMatch: []
			});

			const product = {
				product: { code: '123' },
				attributes: [{ id: 'a1' }]
			} as ProductWithAttributes;

			const userPreferences = [{ id: 'pref1' }] as any;

			const result = scoreProduct(product, userPreferences);

			expect(calculateScore).toHaveBeenCalledWith(product.attributes, userPreferences);
			expect(result).toEqual({
				product,
				score: 12,
				matchStatus: 'match',
				scoreData: {
					score: 12,
					matchStatus: 'match',
					matched: [],
					unmatched: [],
					doesNotMatch: []
				}
			});
		});

		it('uses empty attributes array when product.attributes is undefined', () => {
			vi.mocked(calculateScore).mockReturnValue({
				score: 0,
				matchStatus: 'unknown',
				matched: [],
				unmatched: [],
				doesNotMatch: []
			});

			const product = {
				product: { code: '456' }
			} as ProductWithAttributes;

			scoreProduct(product, [] as any);

			expect(calculateScore).toHaveBeenCalledWith([], []);
		});
	});

	describe('byMatchScore', () => {
		it('ranks products with better scores first', () => {
			const high = {
				product: { product: { code: 'high' } },
				score: 10,
				matchStatus: 'match',
				scoreData: {} as any
			};

			const low = {
				product: { product: { code: 'low' } },
				score: 4,
				matchStatus: 'match',
				scoreData: {} as any
			};

			expect(byMatchScore(high, low)).toBeLessThan(0);
			expect(byMatchScore(low, high)).toBeGreaterThan(0);
		});

		it('pushes does_not_match products lower', () => {
			const match = {
				product: { product: { code: 'match' } },
				score: 1,
				matchStatus: 'match',
				scoreData: {} as any
			};

			const doesNotMatch = {
				product: { product: { code: 'dnm' } },
				score: 100,
				matchStatus: 'does_not_match',
				scoreData: {} as any
			};

			expect(byMatchScore(match, doesNotMatch)).toBeLessThan(0);
			expect(byMatchScore(doesNotMatch, match)).toBeGreaterThan(0);
		});

		it('returns 0 for equal scores and same match status to preserve original order', () => {
			const a = {
				product: { product: { code: 'a' } },
				score: 5,
				matchStatus: 'match',
				scoreData: {} as any
			};

			const b = {
				product: { product: { code: 'b' } },
				score: 5,
				matchStatus: 'match',
				scoreData: {} as any
			};

			expect(byMatchScore(a, b)).toBe(0);
		});
	});

	describe('personalizeSearchResults', () => {
		it('ranks products with better match scores first', () => {
			vi.mocked(calculateScore)
				.mockReturnValueOnce({
					score: 2,
					matchStatus: 'match',
					matched: [],
					unmatched: [],
					doesNotMatch: []
				})
				.mockReturnValueOnce({
					score: 9,
					matchStatus: 'match',
					matched: [],
					unmatched: [],
					doesNotMatch: []
				});

			const products = [
				{ product: { code: 'low' }, attributes: [] },
				{ product: { code: 'high' }, attributes: [] }
			];

			const result = personalizeSearchResults(products, [] as any, true);

			expect(result.map((p) => p.product.product.code)).toEqual(['high', 'low']);
		});

		it('pushes does_not_match products lower', () => {
			vi.mocked(calculateScore)
				.mockReturnValueOnce({
					score: 10,
					matchStatus: 'does_not_match',
					matched: [],
					unmatched: [],
					doesNotMatch: []
				})
				.mockReturnValueOnce({
					score: 1,
					matchStatus: 'match',
					matched: [],
					unmatched: [],
					doesNotMatch: []
				});

			const products = [
				{ product: { code: 'bad' }, attributes: [] },
				{ product: { code: 'good' }, attributes: [] }
			];

			const result = personalizeSearchResults(products, [] as any, true);

			expect(result.map((p) => p.product.product.code)).toEqual(['good', 'bad']);
		});

		it('preserves original order when scores are equal', () => {
			vi.mocked(calculateScore)
				.mockReturnValueOnce({
					score: 5,
					matchStatus: 'match',
					matched: [],
					unmatched: [],
					doesNotMatch: []
				})
				.mockReturnValueOnce({
					score: 5,
					matchStatus: 'match',
					matched: [],
					unmatched: [],
					doesNotMatch: []
				});

			const products = [
				{ product: { code: 'first' }, attributes: [] },
				{ product: { code: 'second' }, attributes: [] }
			];

			const result = personalizeSearchResults(products, [] as any, true);

			expect(result.map((p) => p.product.product.code)).toEqual(['first', 'second']);
		});

		it('does not reorder results when classifyEnabled is false', () => {
			vi.mocked(calculateScore)
				.mockReturnValueOnce({
					score: 1,
					matchStatus: 'match',
					matched: [],
					unmatched: [],
					doesNotMatch: []
				})
				.mockReturnValueOnce({
					score: 10,
					matchStatus: 'match',
					matched: [],
					unmatched: [],
					doesNotMatch: []
				});

			const products = [
				{ product: { code: 'first' }, attributes: [] },
				{ product: { code: 'second' }, attributes: [] }
			];

			const result = personalizeSearchResults(products, [] as any, false);

			expect(result.map((p) => p.product.product.code)).toEqual(['first', 'second']);
		});

		it('returns empty array for empty input', () => {
			const result = personalizeSearchResults([], [] as any, true);
			expect(result).toEqual([]);
		});
	});
});