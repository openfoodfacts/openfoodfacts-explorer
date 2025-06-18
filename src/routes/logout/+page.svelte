<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userLoginState } from '$lib/stores/userStore';
	import Card from '$lib/ui/Card.svelte';
	import { keycloak, pkceClientId } from '$lib/stores/pkceLoginStore';

	onMount(() => {
		// delete all the cookies
		// document.cookie.split(';').forEach((cookie) => {
		// 	document.cookie = cookie
		// 		.replace(/^ +/, '')
		// 		.replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/;secure;samesite=strict');
		// });
		// set the userLoginState to false
		// userLoginState.set(false);
		// redirect to the home page
		// goto('/');

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

		const redirectUri = 'http://localhost:5173/logout_callback';
		// userLoginState.set(false); // Set user login state to false
		window.location.href = `${keycloak}/protocol/openid-connect/logout?client_id=${pkceClientId}&post_logout_redirect_uri=${encodeURIComponent(redirectUri)}&id_token_hint=${idToken}`;
	}
</script>

<Card>
	<div class="flex h-full w-full items-center justify-center">
		<p>Logging you out. Please wait..</p>
	</div>
</Card>
