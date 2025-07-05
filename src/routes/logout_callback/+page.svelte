<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Card from '$lib/ui/Card.svelte';
	import { userAuthTokens } from '$lib/stores/pkceLoginStore';

	onMount(() => {
		userAuthTokens.set({ accessToken: '', refreshToken: '', idToken: '' });
		// redirect to the home page
		goto('/');
	});
</script>

<Card>
	<div class="flex h-full w-full items-center justify-center">
		<p>Redirecting to Home page. Please wait..</p>
	</div>
</Card>
