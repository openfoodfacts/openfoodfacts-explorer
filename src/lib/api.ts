import { Robotoff } from '@openfoodfacts/openfoodfacts-nodejs';
import { ssrSafeFetch, wrapFetchWithCredentials } from './api/utils';
import { KEYCLOAK_URL, OAUTH_CLIENT_ID, OAUTH_REDIRECT_URI, ROBOTOFF_URL } from './const';
import { KeycloakApi } from './api/keycloak';
import { browser } from '$app/environment';

export * from './api/taxonomy/api';
export * from './api/taxonomy/types';

export * from './api/product';
export * from './api/nutriments';

export * from './api/knowledgepanels';
export * from './api/externalSources';

export function createRobotoffApi(fetch: typeof window.fetch) {
	const rawUrl = browser ? new URL(ROBOTOFF_URL, window.location.origin) : new URL(ROBOTOFF_URL);
	const { fetch: wrappedFetch, url } = wrapFetchWithCredentials(ssrSafeFetch(fetch), rawUrl);

	const robotoffFetch: typeof fetch = browser
		? async (input, init) => {
				const requestUrl = new URL(
					input instanceof Request ? input.url : input.toString(),
					window.location.origin
				);
				requestUrl.pathname = `${ROBOTOFF_URL}${requestUrl.pathname}`;

				if (input instanceof Request) {
					return wrappedFetch(new Request(requestUrl, input), init);
				}
				return wrappedFetch(requestUrl, init);
			}
		: wrappedFetch;

	return new Robotoff(robotoffFetch, { baseUrl: url.toString() });
}

export function createKeycloakApi(fetch: typeof window.fetch, url: URL) {
	const keycloakUrl = KEYCLOAK_URL;
	const clientId = OAUTH_CLIENT_ID;
	if (!keycloakUrl || !clientId) {
		throw new Error('Missing Keycloak configuration');
	}

	const cleanUrl = new URL(url.pathname, url.origin);
	const redirectUri = OAUTH_REDIRECT_URI(cleanUrl);

	return new KeycloakApi(fetch, { keycloakUrl, clientId, redirectUri });
}
