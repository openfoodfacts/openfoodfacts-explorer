import { describe, expect, it } from 'vitest';
import { variables } from './env';

describe('PUBLIC_SENTRY_ENABLED', () => {
	it('is disabled by default and only enabled explicitly', () => {
		const validate = variables.PUBLIC_SENTRY_ENABLED.schema['~standard'].validate;
		expect(validate(undefined)).toEqual({ value: false });
		expect(validate('false')).toEqual({ value: false });
		expect(validate('true')).toEqual({ value: true });
	});
});
