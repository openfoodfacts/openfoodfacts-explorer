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

import { CURRENT_USER_PERMISSIONS_URL } from '$lib/const';
import { fetchCurrentUserPermissions } from '$lib/api/permissions';

export const userInfo = derived<typeof userAuthTokens, UserInfo | null>(
	userAuthTokens,
	($tokens, set) => {
		if (!$tokens || !$tokens.id_token) {
			set(null);
			return;
		}

		let baseInfo: UserInfo;
		try {
			baseInfo = parseIdToken($tokens.id_token);
			// Set initial state from JWT (roles are usually false from Keycloak)
			set(baseInfo);
		} catch (error) {
			console.error('Failed to parse user info:', error);
			set(null);
			return;
		}

		// Fetch admin/moderator roles
		if (typeof globalThis !== 'undefined' && globalThis.fetch) {
			fetchCurrentUserPermissions(
				globalThis.fetch,
				CURRENT_USER_PERMISSIONS_URL,
				$tokens.access_token
			)
				.then((permissions) => {
					if (permissions && permissions.status === 'success' && permissions.user) {
						// Merge permissions into the existing derived store value
						set({
							...baseInfo,
							isAdmin: baseInfo.isAdmin || permissions.user.admin === 1,
							isModerator: baseInfo.isModerator || permissions.user.moderator === 1
						});
					}
				})
				.catch((err) => {
					console.error('Failed to fetch OFF user permissions', err);
				});
		}
	},
	null
);

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
		throw new Error(`Failed to parse ID token`, { cause: error });
	}
}
