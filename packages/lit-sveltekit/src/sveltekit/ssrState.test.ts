import { describe, expect, it } from 'vitest';
import { parseLitSsrState, serializeLitSsrState } from './ssrState.js';

function encode(value: unknown): string {
	return encodeURIComponent(JSON.stringify(value));
}

describe('Lit SSR state', () => {
	it('round-trips nested JSON values and special characters', () => {
		const properties = {
			product: { name: 'Crème "&" <script> 🍎', labels: ['organic'], quantity: null },
			showMatchTag: false,
			score: 0
		};
		const attributes = { class: 'card', 'aria-label': '"Product" & more' };
		expect(parseLitSsrState(serializeLitSsrState(properties, attributes))).toEqual({
			properties,
			attributes
		});
	});

	it.each([{}, { properties: { score: 0 } }, { attributes: { class: 'card' } }])(
		'defaults missing fields to empty records: %j',
		(state) => {
			expect(parseLitSsrState(encode(state))).toEqual({
				properties: {},
				attributes: {},
				...state
			});
		}
	);

	it.each([null, [], ['value'], 'value', 42, true])('rejects invalid outer state: %j', (state) => {
		expect(() => parseLitSsrState(encode(state))).toThrow('Invalid Lit SSR state');
	});

	for (const field of ['properties', 'attributes']) {
		it.each([null, [], ['value'], 'value', 42, true, false])(
			`rejects invalid ${field}: %j`,
			(value) => {
				expect(() => parseLitSsrState(encode({ [field]: value }))).toThrow('Invalid Lit SSR state');
			}
		);
	}

	it.each(['', '%', '%E0%A4%A', encodeURIComponent('{')])(
		'rejects malformed URI encoding or JSON: %j',
		(encoded) => {
			expect(() => parseLitSsrState(encoded)).toThrow();
		}
	);

	it('skips serialization for circular state', () => {
		const properties: Record<string, unknown> = {};
		properties.self = properties;
		expect(serializeLitSsrState(properties, {})).toBe('');
	});

	it('skips serialization for values unsupported by JSON', () => {
		expect(serializeLitSsrState({ count: 1n }, {})).toBe('');
	});
});
