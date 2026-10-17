import { describe, it, expect } from 'vitest';
import { resolvePermissions, type UserPermissionsContext } from './user';

describe('resolvePermissions', () => {
	const defaultPermissions: UserPermissionsContext = {
		isAdmin: false,
		isModerator: false
	};

	it('returns actual permissions unchanged when isDev is false', () => {
		const res = resolvePermissions(defaultPermissions, 'moderator', false);
		expect(res).toEqual({ isAdmin: false, isModerator: false });
	});

	it('returns actual permissions unchanged in dev when forceRole is not provided or empty', () => {
		expect(resolvePermissions(defaultPermissions, undefined, true)).toEqual(defaultPermissions);
		expect(resolvePermissions(defaultPermissions, '', true)).toEqual(defaultPermissions);
	});

	it('forces moderator permission in dev when forceRole is "moderator"', () => {
		const res = resolvePermissions(defaultPermissions, 'moderator', true);
		expect(res).toEqual({ isAdmin: false, isModerator: true });
	});

	it('handles case-insensitivity and whitespace for moderator role', () => {
		const res = resolvePermissions(defaultPermissions, '  MODERATOR  ', true);
		expect(res).toEqual({ isAdmin: false, isModerator: true });
	});

	it('ignores unhandled roles like admin or unknown strings', () => {
		const res = resolvePermissions(defaultPermissions, 'admin', true);
		expect(res).toEqual(defaultPermissions);
	});

	it('preserves existing true permissions from actual user roles', () => {
		const adminPermissions: UserPermissionsContext = {
			isAdmin: true,
			isModerator: false
		};
		const res = resolvePermissions(adminPermissions, 'moderator', true);
		expect(res).toEqual({ isAdmin: true, isModerator: true });
	});
});
