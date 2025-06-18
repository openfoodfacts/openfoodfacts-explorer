<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userLoginState } from '$lib/stores/userStore';

	onMount(() => {
		// delete all the cookies
		document.cookie.split(';').forEach((cookie) => {
			document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/;secure;samesite=strict');
		});
		// set the userLoginState to false
		userLoginState.set(false);
		// redirect to the home page
		goto('/');
	});
</script>