<script>
	import { goto } from "$app/navigation";
	import { keycloak, pkceClientId } from "$lib/stores/pkceLoginStore";
	import { get } from "svelte/store";
	import { onMount } from 'svelte';

    async function getAccessToken() {
		// http://localhost:5173/?state=10434643858497371922&session_state=11890927-9a18-4be3-bf83-4e35f5aa312f&iss=http%3A%2F%2Fauth.openfoodfacts.localhost%3A5600%2Frealms%2Fopen-products-facts&code=8a2eaaab-9214-4a3c-ad8f-62cb295b797a.11890927-9a18-4be3-bf83-4e35f5aa312f.b26fbd11-4f08-4998-b27d-7c2ee61d0ba5

		const verifier = localStorage.getItem('verifier');
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');

		const body = new URLSearchParams({
			code: code ?? '',
			grant_type: 'authorization_code',
			redirect_uri: 'http://localhost:5173/callback', // changed to match login redirect_uri
			client_id: pkceClientId,
			code_verifier: verifier ?? ''
		});
		const response = await fetch(`${keycloak}/protocol/openid-connect/token`, {
			method: 'POST',
			body: body,
			headers: new Headers()
		});

		const jwt = await response.json();
		// const accessToken = JSON.parse(atob(jwt.access_token.split('.')[1]));

		// Save accessToken and refreshToken in cookies (expires in jwt.expires_in seconds)
		const expires = new Date(Date.now() + jwt.expires_in * 1000).toUTCString();
		document.cookie = `userAccessToken=${jwt.access_token}; expires=${expires}; path=/; secure; samesite=strict`;

        // If a refresh token is provided, set it in cookies
		if (jwt.refresh_token) {
			// Set refresh token cookie with a longer expiry if available (e.g., 30 days)
			const refreshExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
			document.cookie = `userRefreshToken=${jwt.refresh_token}; expires=${refreshExpires}; path=/; secure; samesite=strict`;
		}

		// save id token in cookies
		document.cookie = `userIdToken=${jwt.id_token}; expires=${expires}; path=/; secure; samesite=strict`;

        goto('/');

		// return {
		// 	accessToken: jwt.access_token,
		// 	idToken: jwt.id_token,
		// 	expiresIn: jwt.expires_in,
		// 	refreshToken: jwt.refresh_token,
		// 	accessTokenPayload: accessToken
		// };
	}
    onMount(() => {
        getAccessToken();
    });
</script>

