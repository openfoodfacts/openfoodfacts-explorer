import { describe, it, expect } from 'vitest';
import { checkAuthorization, createPermissionsContext } from './user';

describe('checkAuthorization', () => {
	it('authorizes any role match in user roles when in production', () => {
		expect(checkAuthorization(['moderator'], ['moderator'], undefined, false)).toBe(true);
		expect(checkAuthorization(['admin'], ['moderator'], undefined, false)).toBe(false);
		expect(checkAuthorization(['admin', 'moderator'], ['moderator'], undefined, false)).toBe(true);
		expect(checkAuthorization(['admin'], ['moderator', 'admin'], undefined, false)).toBe(true);
	});

	it('forces role authorization in development mode when forceRole matches one of required roles', () => {
		expect(checkAuthorization([], ['moderator'], 'moderator', true)).toBe(true);
		expect(checkAuthorization([], ['admin', 'moderator'], 'moderator', true)).toBe(true);
	});

	it('handles case-insensitivity and whitespace in forceRole and requiredRoles', () => {
		expect(checkAuthorization([], ['moderator'], '  MODERATOR  ', true)).toBe(true);
		expect(checkAuthorization([], [' MODERATOR '], 'moderator', true)).toBe(true);
	});

	it('strictly ignores forceRole when isDev is false', () => {
		expect(checkAuthorization([], ['moderator'], 'moderator', false)).toBe(false);
	});

	it('returns false when neither userRoles nor dev forceRole match required roles', () => {
		expect(checkAuthorization(['viewer'], ['moderator', 'admin'], 'editor', true)).toBe(false);
		expect(checkAuthorization([], ['moderator'], '', true)).toBe(false);
		expect(checkAuthorization([], ['moderator'], undefined, true)).toBe(false);
	});
});

describe('createPermissionsContext', () => {
	it('evaluates dynamic user roles and forceRole in dev mode', () => {
		let roles: string[] = [];
		const ctx = createPermissionsContext(() => roles, 'moderator', true);

		expect(ctx.isModerator).toBe(true);
		expect(ctx.isAdmin).toBe(false);
		expect(ctx.isAuthorized(['moderator'])).toBe(true);
		expect(ctx.isAuthorized(['admin'])).toBe(false);

		roles = ['admin'];
		expect(ctx.isAdmin).toBe(true);
		expect(ctx.isAuthorized(['admin'])).toBe(true);
	});

	it('does not force roles when isDev is false', () => {
		let roles: string[] = [];
		const ctx = createPermissionsContext(() => roles, 'moderator', false);

		expect(ctx.isModerator).toBe(false);
		expect(ctx.isAdmin).toBe(false);

		roles = ['moderator'];
		expect(ctx.isModerator).toBe(true);
	});
});
