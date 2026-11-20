import { describe, expect, it } from 'vitest';
import { shouldBeContainer } from './layout.js';

describe('layout routes', () => {
	it.each(['/', '/world-fr', '/world-fr/static/faq', '/world-fr/compare'])(
		'uses the full-width layout for %s',
		(path) => expect(shouldBeContainer(path)).toBe(true)
	);
	it('keeps product pages in a container', () => {
		expect(shouldBeContainer('/world-fr/products/123')).toBe(false);
	});
});
