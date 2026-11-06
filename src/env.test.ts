import { describe, expect, it } from 'vitest';
import { variables } from './env';

describe('PUBLIC_SENTRY_DSN', () => {
	it('defaults to an empty string and preserves a configured DSN', () => {
		const validate = variables.PUBLIC_SENTRY_DSN.schema['~standard'].validate;
		expect(validate(undefined)).toEqual({ value: '' });
		expect(validate('')).toEqual({ value: '' });
		expect(validate('https://example.com/1')).toEqual({ value: 'https://example.com/1' });
	});
});

describe('CLIENT_IP_ALLOWED_ORIGINS', () => {
	const validate = variables.CLIENT_IP_ALLOWED_ORIGINS.schema['~standard'].validate;

	it('parses whitespace-separated origins and defaults', async () => {
		expect(await validate(' https://example.org\t https://example.net ')).toEqual({
			value: new Set(['https://example.org', 'https://example.net'])
		});
		expect(await validate('')).toEqual({ value: new Set() });
		expect(await validate(undefined)).toEqual({ value: new Set() });
	});

	it.each([
		'http://example.org',
		'https://example.org/path',
		'https://user@example.org',
		'https://example.org?q=1',
		'not-a-url'
	])('rejects invalid origin %s', async (value) => {
		expect((await validate(value)).issues).toBeDefined();
	});
});
