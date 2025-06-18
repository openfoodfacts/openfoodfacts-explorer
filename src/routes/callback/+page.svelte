<script>
	import { goto } from '$app/navigation';
	import { keycloak, pkceClientId } from '$lib/stores/pkceLoginStore';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import { userLoginState } from '$lib/stores/userStore';

	async function getAccessToken() {
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

        userLoginState.set(true);

		goto('/');
	}
	onMount(() => {
		getAccessToken();
	});
</script>
