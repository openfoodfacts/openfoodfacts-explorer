<script>
	import { onMount } from 'svelte';
	import Card from '$lib/ui/Card.svelte';
	import { KEYCLOAK_URL, AUTH_PKCE_ID, OFF_EXP_BASE_URL } from '$lib/const';
	import { userAuthTokens } from '$lib/stores/pkceLoginStore';

	onMount(() => {
		logoutUser();
	});

	async function logoutUser() {
		userAuthTokens.set({ accessToken: '', refreshToken: '', idToken: '' });

		const redirectUri = `${OFF_EXP_BASE_URL}/logout_callback`;

		window.location.href = `${KEYCLOAK_URL}/protocol/openid-connect/logout?client_id=${AUTH_PKCE_ID}&post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`;
	}
</script>

<Card>
	<div class="flex h-full w-full items-center justify-center">
		<p>Logging you out. Please wait..</p>
	</div>
</Card>
