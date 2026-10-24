import { derived } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import { userAuthTokens } from './auth';
import { decodeJwt } from 'jose';

import { dev as defaultDev } from '$app/env';
import { FORCE_ROLE as defaultForceRole } from '$app/env/public';

export type UserInfo = {
	preferred_username: string;
	email: string;
	roles?: string[];
};

export type UserPermissionsContext = {
	readonly isAdmin: boolean;
	readonly isModerator: boolean;
	readonly roles: string[];
	isAuthorized: (requiredRoles: string[]) => boolean;
};

/**
 * Checks whether the user is authorized for any of the required roles.
 * In development mode, `forceRole` takes precedence.
 */
export function checkAuthorization(
	userRoles: string[],
	requiredRoles: string[],
	forceRole = defaultForceRole,
	isDev = defaultDev
): boolean {
	const normalizedRequired = requiredRoles.map((r) => r.toLowerCase().trim());

	if (isDev && forceRole) {
		const normalizedForce = forceRole.toLowerCase().trim();
		if (normalizedRequired.includes(normalizedForce)) {
			return true;
		}
	}

	const normalizedUser = new Set(userRoles.map((r) => r.toLowerCase().trim()));
	return normalizedRequired.some((role) => normalizedUser.has(role));
}

/**
 * Creates a reactive permissions context linked to the user roles state getter.
 */
export function createPermissionsContext(
	getUserRoles: () => string[],
	forceRole = defaultForceRole,
	isDev = defaultDev
): UserPermissionsContext {
	return {
		get roles() {
			return getUserRoles();
		},
		isAuthorized(requiredRoles: string[]) {
			return checkAuthorization(getUserRoles(), requiredRoles, forceRole, isDev);
		},
		get isAdmin() {
			return this.isAuthorized(['admin']);
		},
		get isModerator() {
			return this.isAuthorized(['moderator']);
		}
	};
}

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

/**
 * Helper to check authorization against the active permissions context.
 */
export function isAuthorized(requiredRoles: string[]): boolean {
	return getPermissionsCtx().isAuthorized(requiredRoles);
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
