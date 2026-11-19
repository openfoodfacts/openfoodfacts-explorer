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
