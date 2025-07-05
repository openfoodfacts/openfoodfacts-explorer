<script>
	import { goto } from '$app/navigation';
	import { getAccessToken, saveAuthTokens } from '$lib/stores/pkceLoginStore';
	import { onMount } from 'svelte';
	import Card from '$lib/ui/Card.svelte';

	let isValidating = true;
	let errorMessage = '';

	onMount(() => {
		// Validate the state parameter
		const urlParams = new URLSearchParams(window.location.search);
		const returnedState = urlParams.get('state');
		const storedState = localStorage.getItem('authState');

		if (!returnedState || returnedState !== storedState) {
			console.error('State validation failed');
			errorMessage = 'Authentication failed: Invalid state parameter';
			isValidating = false;
			return;
		}

		localStorage.removeItem('authState');

		getAccessToken()
			.then((jwt) => {
				saveAuthTokens(jwt);
				goto('/'); // Redirect to the home page after successful login
			})
			.catch((error) => {
				console.error('Error getting access token:', error);
				errorMessage = 'Authentication failed: Unable to get access token';
				isValidating = false;
			});
	});
</script>

<Card>
	<div class="flex h-full w-full items-center justify-center">
		{#if isValidating}
			<p>Redirecting to Home Page. Please wait..</p>
		{:else}
			<p class="text-red-600">{errorMessage}</p>
			<button
				class="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				onclick={() => goto('/')}
			>
				Return to Home
			</button>
		{/if}
	</div>
</Card>
