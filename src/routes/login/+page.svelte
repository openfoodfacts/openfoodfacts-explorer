<script>
	import { onMount } from 'svelte';
	import { keycloak, pkceClientId } from '$lib/stores/pkceLoginStore';
	import Card from '$lib/ui/Card.svelte';

	onMount(() => {
		pkceLogin();
	});

	/**
	 * @param {Uint8Array<ArrayBuffer>} bytes
	 */
	function base64URLEncode(bytes) {
		const b64 = btoa(String.fromCodePoint(...bytes));
		const encoded = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
		return encoded;
	}

	async function pkceLogin() {
		const verifier = base64URLEncode(crypto.getRandomValues(new Uint8Array(32)));
		// Save the verifier so that the code page can access it
		// Should really use sessionStorage but for tests when we click a verification email that starts a separate session
		localStorage.setItem('verifier', verifier);
		const codeChallenge = base64URLEncode(
			new Uint8Array(
				await crypto.subtle.digest({ name: 'SHA-256' }, new TextEncoder().encode(verifier))
			)
		);

		const nonce = crypto.getRandomValues(new BigUint64Array(1))[0];
		const lang = 'en';

		// const redirectUri = `http://localhost:5604/${page}.html?clientId=${clientId}&pkceClientId=${pkceClientId}&clientSecret=${clientSecret}&lang=${lang}&keycloak=${encodeURIComponent(keycloak)}&mode=pkce`;
		const redirectUri = 'http://localhost:5173/callback';

		const url = `${keycloak}/protocol/openid-connect/auth?response_type=code&client_id=${pkceClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid+profile+offline_access&state=${nonce}&ui_locales=${lang}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
		window.location.href = url;
	}
</script>

<Card>
	<div class="flex justify-center items-center w-full h-full">
	<p>Redirecting to Login Page. Please wait..</p>
    </div>
</Card>