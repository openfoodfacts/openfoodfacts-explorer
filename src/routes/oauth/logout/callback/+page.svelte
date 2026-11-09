<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { completeLogout } from '#lib/auth/logout.js';
	import { _ } from '#lib/i18n/index.js';
	import { onMount } from 'svelte';

	async function doLogout() {
		const returnedState = page.url.searchParams.get('state');
		completeLogout(returnedState);
		await goto('/');
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
