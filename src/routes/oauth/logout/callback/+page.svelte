<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '#lib/navigation.js';
	import { completeLogout } from '#lib/auth/logout.js';
	import { getAuthTokens } from '#lib/stores/auth.js';
	import { _ } from '#lib/i18n/index.js';
	import { onMount } from 'svelte';

	async function doLogout() {
		const returnedState = page.url.searchParams.get('state');
		try {
			completeLogout(returnedState);
		} catch (error) {
			// If already logged out (e.g. back navigation to consumed callback), redirect home
			if (!getAuthTokens()) {
				await goto('/', { replaceState: true });
				return;
			}
			throw error;
		}
		await goto('/', { replaceState: true });
	}

	let logoutResult: Promise<void> | null = $state(null);

	onMount(() => {
		logoutResult = doLogout();
	});
</script>

<div class="flex h-screen w-full items-center justify-center">
	<div class="text-center">
		{#if logoutResult}
			{#await logoutResult}
				<p class="mb-4 text-xl font-medium">
					{$_('oauth.logout.in_progress', { default: 'Logging out…' })}
				</p>
				<progress class="progress w-56"></progress>
			{:catch}
				<p class="mb-4 text-xl font-medium text-error">
					{$_('oauth.logout.failed', {
						default: 'Logout could not be verified. Please try again.'
					})}
				</p>
				<a class="btn btn-outline btn-primary" href="/">
					{$_('oauth.logout.return_home', { default: 'Return home' })}
				</a>
			{/await}
		{/if}
	</div>
</div>
