<script lang="ts">
	import { goto } from '$app/navigation';
	import { clearAuthTokens } from '$lib/stores/auth';

	async function doLogout() {
		clearAuthTokens();
		goto('/'); // Redirect to home page after logout
	}

	$effect(() => {
		doLogout();
	});
</script>

<div class="flex h-screen w-full items-center justify-center">
	<div class="text-center">
		<p class="mb-4 text-xl font-medium">Logging out...</p>
		<progress class="progress w-56"></progress>
	</div>
</div>
