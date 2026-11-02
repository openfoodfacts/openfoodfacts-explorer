import { describe, expect, it, vi, beforeEach } from 'vitest';
import { tracker, trackOffEvent, trackOffSiteSearch } from './analytics.js';
import type { Tracker } from '#lib/matomo/tracker.js';

describe('analytics', () => {
	let mockTracker: Partial<Tracker>;

	beforeEach(() => {
		mockTracker = {
			trackEvent: vi.fn(),
			trackSiteSearch: vi.fn()
		};
		tracker.set(null);
	});

	describe('trackOffEvent', () => {
		it('does nothing when tracker is null', () => {
			tracker.set(null);
			trackOffEvent('knowledge_panel', 'panel_toggled', 'environment_card', 1);
			expect(mockTracker.trackEvent).not.toHaveBeenCalled();
		});

		it('tracks events with all arguments when tracker is active', () => {
			tracker.set(mockTracker as Tracker);

			trackOffEvent('knowledge_panel', 'panel_toggled', 'environment_card', 1);

			expect(mockTracker.trackEvent).toHaveBeenCalledTimes(1);
			expect(mockTracker.trackEvent).toHaveBeenCalledWith(
				'knowledge_panel',
				'panel_toggled',
				'environment_card',
				1
			);
		});

		it('tracks events with category and action only', () => {
			tracker.set(mockTracker as Tracker);

			trackOffEvent('account', 'login_succeeded');

			expect(mockTracker.trackEvent).toHaveBeenCalledTimes(1);
			expect(mockTracker.trackEvent).toHaveBeenCalledWith(
				'account',
				'login_succeeded',
				undefined,
				undefined
			);
		});

		it('catches and suppresses any tracker errors while ensuring the call was made', () => {
			mockTracker.trackEvent = vi.fn().mockImplementation(() => {
				throw new Error('Matomo tracking failed');
			});
			tracker.set(mockTracker as Tracker);

			expect(() => {
				trackOffEvent('feature', 'report_problem_opened', 'product_header');
			}).not.toThrow();
			expect(mockTracker.trackEvent).toHaveBeenCalledTimes(1);
		});
	});

	describe('trackOffSiteSearch', () => {
		it('tracks normal search queries with results count', () => {
			tracker.set(mockTracker as Tracker);

			trackOffSiteSearch('organic oat milk', 25);

			expect(mockTracker.trackSiteSearch).toHaveBeenCalledTimes(1);
			expect(mockTracker.trackSiteSearch).toHaveBeenCalledWith('organic oat milk', 'products', 25);
		});

		it('trims leading and trailing whitespace from query', () => {
			tracker.set(mockTracker as Tracker);

			trackOffSiteSearch('   cereal   ');

			expect(mockTracker.trackSiteSearch).toHaveBeenCalledTimes(1);
			expect(mockTracker.trackSiteSearch).toHaveBeenCalledWith('cereal', 'products', undefined);
		});

		it('rejects empty and whitespace-only queries', () => {
			tracker.set(mockTracker as Tracker);

			trackOffSiteSearch('');
			trackOffSiteSearch('     ');

			expect(mockTracker.trackSiteSearch).not.toHaveBeenCalled();
		});

		it.each([
			['3017620422003'],
			['12345'],
			['3017-6204-22003'],
			['  3017 6204 22003  '],
			['1'.repeat(18)]
		])('rejects barcode-like query "%s"', (barcode) => {
			tracker.set(mockTracker as Tracker);
			trackOffSiteSearch(barcode);
			expect(mockTracker.trackSiteSearch).not.toHaveBeenCalled();
		});

		it.each(['nutella 3017620422003', 'nutella3017620422003', '3017620422003ml'])(
			'rejects embedded barcodes within search queries: "%s"',
			(query) => {
				tracker.set(mockTracker as Tracker);
				trackOffSiteSearch(query);
				expect(mockTracker.trackSiteSearch).not.toHaveBeenCalled();
			}
		);

		it('tracks 4-digit numbers below the 5-digit barcode threshold', () => {
			tracker.set(mockTracker as Tracker);
			trackOffSiteSearch('1234');
			expect(mockTracker.trackSiteSearch).toHaveBeenCalledWith('1234', 'products', undefined);
		});

		it('tracks numbers with 19 or more digits above the 18-digit barcode threshold', () => {
			tracker.set(mockTracker as Tracker);
			const nineteenDigits = '1'.repeat(19);
			trackOffSiteSearch(nineteenDigits);
			expect(mockTracker.trackSiteSearch).toHaveBeenCalledWith(
				nineteenDigits,
				'products',
				undefined
			);
		});

		it.each(['7up', '2% milk', 'coca cola 330ml'])(
			'tracks product names containing numbers: "%s"',
			(productName) => {
				tracker.set(mockTracker as Tracker);
				trackOffSiteSearch(productName);
				expect(mockTracker.trackSiteSearch).toHaveBeenCalledWith(
					productName,
					'products',
					undefined
				);
			}
		);

		it.each([
			'contributor@example.com',
			'hello@openfoodfacts.org',
			'write to me@example.com please'
		])('rejects queries containing email addresses: "%s"', (query) => {
			tracker.set(mockTracker as Tracker);
			trackOffSiteSearch(query);
			expect(mockTracker.trackSiteSearch).not.toHaveBeenCalled();
		});

		it.each(['user@', '@', 'user@host'])(
			'tracks queries with at-sign that are not valid emails: "%s"',
			(term) => {
				tracker.set(mockTracker as Tracker);
				trackOffSiteSearch(term);
				expect(mockTracker.trackSiteSearch).toHaveBeenCalledWith(term, 'products', undefined);
			}
		);

		it('does nothing when tracker is null', () => {
			tracker.set(null);
			trackOffSiteSearch('apple juice', 5);
			expect(mockTracker.trackSiteSearch).not.toHaveBeenCalled();
		});

		it('catches and suppresses any tracker errors while ensuring the call was made', () => {
			mockTracker.trackSiteSearch = vi.fn().mockImplementation(() => {
				throw new Error('Matomo site search tracking failed');
			});
			tracker.set(mockTracker as Tracker);

			expect(() => {
				trackOffSiteSearch('chocolate', 10);
			}).not.toThrow();
			expect(mockTracker.trackSiteSearch).toHaveBeenCalledTimes(1);
		});
	});
});
