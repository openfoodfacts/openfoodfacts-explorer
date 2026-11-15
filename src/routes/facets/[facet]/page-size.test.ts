import { describe, expect, it } from 'vitest';
import { getPageForNewPageSize } from './page-size';

describe('getPageForNewPageSize', () => {
	it('keeps the page containing the first visible item when increasing page size', () => {
		// Page 2000 with size 10 starts at 0-based item index 19990.
		// At size 200, index 19990 falls on page 100 (items 19800..19999).
		expect(getPageForNewPageSize(2000, 10, 200, 29000)).toBe(100);
	});

	it('keeps the page containing the first visible item when decreasing page size', () => {
		// Page 3 with size 50 starts at index 100.
		// At size 10, index 100 falls on page 11.
		expect(getPageForNewPageSize(3, 50, 10, 500)).toBe(11);
	});

	it('stays on page 1 when on page 1', () => {
		expect(getPageForNewPageSize(1, 10, 200, 29000)).toBe(1);
	});

	it('clamps to the last valid page if the previous page was out of bounds', () => {
		expect(getPageForNewPageSize(5000, 10, 200, 29000)).toBe(145);
	});

	it('returns page 1 when totalCount is 0', () => {
		expect(getPageForNewPageSize(5, 10, 50, 0)).toBe(1);
	});
});
