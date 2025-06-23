<script>
	import { onMount } from 'svelte';
	import Card from '$lib/ui/Card.svelte';
	import { keycloak, pkceClientId } from '$lib/stores/pkceLoginStore';
	import { OFF_EXP_BASE_URL } from '$lib/const';

	onMount(() => {
		logoutUser();
	});

	async function logoutUser() {
		const cookies = document.cookie.split('; ');
		const idTokenCookie = cookies.find((cookie) => cookie.startsWith('userIdToken='));
		const idToken = idTokenCookie ? idTokenCookie.split('=')[1] : '';
		if (!idToken) {
			console.error('No ID token found in cookies. Cannot log out.');
			return;
		}

		const redirectUri = `${OFF_EXP_BASE_URL}/logout_callback`;

		window.location.href = `${keycloak}/protocol/openid-connect/logout?client_id=${pkceClientId}&post_logout_redirect_uri=${encodeURIComponent(redirectUri)}&id_token_hint=${idToken}`;
	}
</script>

<Card>
	<div class="flex h-full w-full items-center justify-center">
		<p>Logging you out. Please wait..</p>
	</div>
</Card>
