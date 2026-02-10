import { derived } from 'svelte/store';
import { userAuthTokens } from './auth';
import { decodeJwt } from 'jose';

type SpecialRole = 'admin' | 'moderator';
type SpecialRoleKeys = `is${Capitalize<SpecialRole>}`;

export type UserInfo = {
	preferred_username: string;
	email: string;
	roles?: string[];
} & Record<SpecialRoleKeys, boolean>;

export const userInfo = derived(userAuthTokens, ($tokens) => {
	if (!$tokens || !$tokens.id_token) {
		return null;
	}

	try {
		return parseIdToken($tokens.id_token);
	} catch (error) {
		console.error('Failed to parse user info:', error);
		return null;
	}
});

type KeycloakToken = {
	preferred_username: string;
	email: string;
	realm_access?: {
		roles: string[];
	};
	resource_access?: Record<string, { roles: string[] }>;
};

/**
 * Parses the ID token to extract user information.
 * @param idToken - the ID token from the JWT.
 * @returns the parsed user information.
 */
function parseIdToken(idToken: string): UserInfo {
	if (!idToken) {
		throw new Error('ID token is required for parsing');
	}

	try {
		const token = decodeJwt<KeycloakToken>(idToken);
		const roles = token.realm_access?.roles || [];

		return {
			preferred_username: token.preferred_username,
			email: token.email,
			roles,
			isAdmin: roles.includes('admin'),
			isModerator: roles.includes('moderator')
		};
	} catch (error) {
		throw new Error(`Failed to parse ID token: ${error}`);
	}
}
