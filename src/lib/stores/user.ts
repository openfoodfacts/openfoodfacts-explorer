import { derived } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import { userAuthTokens } from './auth';
import { decodeJwt } from 'jose';

export type UserInfo = {
	preferred_username: string;
	email: string;
	roles?: string[];
};

export type UserPermissionsContext = {
	isAdmin: boolean;
	isModerator: boolean;
};

export function setPermissionsCtx(ctx: () => UserPermissionsContext) {
	setContext('permissions-ctx', ctx);
}

export function getPermissionsCtx(): UserPermissionsContext {
	const lambda = getContext('permissions-ctx') as (() => UserPermissionsContext) | undefined;
	if (!lambda) {
		throw new Error('User permissions context not found');
	}
	return lambda();
}

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
			roles
		};
	} catch (error) {
		throw new Error(`Failed to parse ID token`, { cause: error });
	}
}
