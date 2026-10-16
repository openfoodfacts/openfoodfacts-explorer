import { describe, expect, it } from 'vitest';

import { OAUTH_LOGOUT_REDIRECT_URI, OAUTH_REDIRECT_URI } from './const.js';

describe('OAuth callback URLs', () => {
	it('uses fixed callbacks regardless of the current location prefix', () => {
		for (const path of ['/world-en/search', '/fr-fr/products/123', '/']) {
			const url = new URL(path, 'https://beta.openfoodfacts.net');
			expect(OAUTH_REDIRECT_URI(url)).toBe('https://beta.openfoodfacts.net/oauth/login/callback');
			expect(OAUTH_LOGOUT_REDIRECT_URI(url)).toBe(
				'https://beta.openfoodfacts.net/oauth/logout/callback'
			);
		}
	});
});
