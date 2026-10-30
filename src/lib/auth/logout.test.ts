import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#lib/analytics.js', () => ({ trackOffEvent: vi.fn() }));
vi.mock('#lib/stores/auth.js', () => ({ clearAuthTokens: vi.fn() }));

import { trackOffEvent } from '#lib/analytics.js';
import { clearAuthTokens } from '#lib/stores/auth.js';
import { completeLogout } from './logout';

const storedValues = new Map<string, string>();

const sessionStorageMock = {
	getItem: (key: string) => storedValues.get(key) ?? null,
	setItem: (key: string, value: string) => storedValues.set(key, value),
	removeItem: (key: string) => storedValues.delete(key)
};

describe('completeLogout', () => {
	beforeEach(() => {
		storedValues.clear();
		vi.clearAllMocks();
		vi.stubGlobal('sessionStorage', sessionStorageMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('clears tokens and records success for a matching state', () => {
		sessionStorageMock.setItem('logoutState', 'expected-state');

		completeLogout('expected-state');

		expect(clearAuthTokens).toHaveBeenCalledOnce();
		expect(trackOffEvent).toHaveBeenCalledOnce();
		expect(trackOffEvent).toHaveBeenCalledWith('account', 'logout_succeeded');
		expect(sessionStorageMock.getItem('logoutState')).toBeNull();
	});

	it('throws when the callback state is missing without clearing tokens', () => {
		sessionStorageMock.setItem('logoutState', 'expected-state');

		expect(() => completeLogout(null)).toThrow('Logout callback state validation failed');
		expect(clearAuthTokens).not.toHaveBeenCalled();
		expect(trackOffEvent).not.toHaveBeenCalled();
		expect(sessionStorageMock.getItem('logoutState')).toBe('expected-state');
	});

	it('throws when the callback state does not match without clearing tokens', () => {
		sessionStorageMock.setItem('logoutState', 'expected-state');

		expect(() => completeLogout('unexpected-state')).toThrow(
			'Logout callback state validation failed'
		);
		expect(clearAuthTokens).not.toHaveBeenCalled();
		expect(trackOffEvent).not.toHaveBeenCalled();
		expect(sessionStorageMock.getItem('logoutState')).toBe('expected-state');
	});

	it('rejects reuse of a state after it has been consumed', () => {
		sessionStorageMock.setItem('logoutState', 'one-time-state');

		completeLogout('one-time-state');

		expect(() => completeLogout('one-time-state')).toThrow(
			'Logout callback state validation failed'
		);
		expect(clearAuthTokens).toHaveBeenCalledOnce();
		expect(trackOffEvent).toHaveBeenCalledOnce();
	});
});
