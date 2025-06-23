<script>
	import { goto } from '$app/navigation';
	import { getAccessToken, saveAuthTokens } from '$lib/stores/pkceLoginStore';
	import { onMount } from 'svelte';
	import Card from '$lib/ui/Card.svelte';
	import { userLoginState } from '$lib/stores/userStore';

	onMount(() => {
		getAccessToken(false)
			.then((jwt) => {
				saveAuthTokens(jwt);
				userLoginState.set(true);
				goto('/'); // Redirect to the home page after successful login
			})
			.catch((error) => {
				console.error('Error getting access token:', error);
				goto('/'); // If there's an error, redirect to the home page
			});
	});
</script>

<Card>
	<div class="flex h-full w-full items-center justify-center">
		<p>Redirecting to Home Page. Please wait..</p>
	</div>
</Card>
