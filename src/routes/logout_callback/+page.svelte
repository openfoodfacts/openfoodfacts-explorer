<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
	import Card from '$lib/ui/Card.svelte';
	import { userLoginState } from '$lib/stores/userStore';
    
    onMount(() => {
		// delete all the cookies
		document.cookie.split(';').forEach((cookie) => {
			document.cookie = cookie
				.replace(/^ +/, '')
				.replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/;secure;samesite=strict');
		});
		// set the userLoginState to false
		userLoginState.set(false);
		// redirect to the home page
		goto('/');
	});
</script>

<Card>
	<div class="flex h-full w-full items-center justify-center">
		<p>Redirecting to Home page. Please wait..</p>
	</div>
</Card>