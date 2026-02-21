import { Robotoff } from '@openfoodfacts/openfoodfacts-nodejs';
import { wrapFetchWithCredentials } from './api/utils';
import { KEYCLOAK_URL, OAUTH_CLIENT_ID, OAUTH_REDIRECT_URI, ROBOTOFF_URL } from './const';
import { KeycloakApi } from './api/keycloak';

export * from './api/taxonomy/api';
export * from './api/taxonomy/types';

export * from './api/product';
export * from './api/nutriments';

export * from './api/knowledgepanels';

export function createRobotoffApi(fetch: typeof globalThis.fetch) {
	const { fetch: wrappedFetch, url } = wrapFetchWithCredentials(
		fetch,
		new URL(ROBOTOFF_URL as string)
	);
	return new Robotoff(wrappedFetch, { baseUrl: url.toString() });
}

export function createKeycloakApi(fetch: typeof globalThis.fetch, url: URL) {
	const keycloakUrl = KEYCLOAK_URL as string;
	const clientId = OAUTH_CLIENT_ID as string;

	const cleanUrl = new URL(url.pathname, url.origin);
	const redirectUri = OAUTH_REDIRECT_URI(cleanUrl);

	return new KeycloakApi(fetch, { keycloakUrl, clientId, redirectUri });
}
