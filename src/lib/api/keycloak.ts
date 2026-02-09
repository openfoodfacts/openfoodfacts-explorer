export type KeycloakTokens = {
	access_token: string;
	refresh_token: string;
	id_token?: string;
	expires_in: number;
	refresh_expires_in: number;
	token_type: string;
};

export class KeycloakApi {
	private fetch: typeof window.fetch;
	private keycloakUrl: string;
	private clientId: string;
	private redirectUri: string;

	constructor(
		fetch: typeof window.fetch,
		config: { keycloakUrl: string; clientId: string; redirectUri: string }
	) {
		this.fetch = fetch;
		this.keycloakUrl = config.keycloakUrl;
		this.clientId = config.clientId;
		this.redirectUri = config.redirectUri;
	}

	private async tokenRequest(body: URLSearchParams): Promise<KeycloakTokens> {
		const tokenEndpoint = `${this.keycloakUrl}/protocol/openid-connect/token`;

		const response = await this.fetch(tokenEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: body
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			throw new Error(
				`Token request failed: ${errorData?.error_description || response.statusText}`
			);
		}

		return response.json();
	}

	/**
	 * Exchanges the authorization code for JWT tokens (access, refresh, ID).
	 *
	 * This is used in the PKCE flow after the user is redirected back from Keycloak with the authorization code.
	 *
	 * @param verifier - the PKCE code verifier stored in local storage before redirecting to Keycloak.
	 * @param code - the authorization code received from the Keycloak callback URL.
	 * @returns the JWT tokens containing access, refresh, and ID tokens.
	 */
	async exchangeCode(params: { verifier: string; code: string }) {
		const body = new URLSearchParams({
			grant_type: 'authorization_code',
			code: params.code,
			code_verifier: params.verifier,

			redirect_uri: this.redirectUri,
			client_id: this.clientId
		});

		return await this.tokenRequest(body);
	}

	/**
	 * Refreshes the access token using the provided refresh token.
	 *
	 * @param refreshToken - the refresh token used to obtain new tokens.
	 * @returns the new JWT tokens containing access, refresh, and ID tokens.
	 */
	async refreshTokens(refreshToken: string) {
		const body = new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken,

			redirect_uri: this.redirectUri,
			client_id: this.clientId
		});

		return await this.tokenRequest(body);
	}

	loginUrl(params: {
		state: string;
		lang?: string;
		scope?: string;
		codeChallenge: string;
		codeChallengeMethod: string;
	}) {
		const url = new URL(`${this.keycloakUrl}/protocol/openid-connect/auth`);

		url.searchParams.set('client_id', this.clientId);
		url.searchParams.set('redirect_uri', this.redirectUri);
		url.searchParams.set('response_type', 'code');
		url.searchParams.set('state', params.state);
		url.searchParams.set('code_challenge', params.codeChallenge);
		url.searchParams.set('code_challenge_method', params.codeChallengeMethod);
		url.searchParams.set('scope', params.scope || 'openid');

		if (params.lang) {
			url.searchParams.set('ui_locales', params.lang);
		}

		return url.toString();
	}

	logoutUrl(params: { refreshToken: string; postLogoutRedirectUri: string }) {
		const url = new URL(`${this.keycloakUrl}/protocol/openid-connect/logout`);

		url.searchParams.set('client_id', this.clientId);
		url.searchParams.set('refresh_token', params.refreshToken);
		url.searchParams.set('post_logout_redirect_uri', params.postLogoutRedirectUri);

		return url.toString();
	}
}
