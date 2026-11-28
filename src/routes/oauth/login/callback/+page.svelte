<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import { completeLoginCallback } from '#lib/auth/login.js';
	import { goto } from '#lib/navigation.js';
	import { resolve } from '#lib/paths.js';

	async function doPkceExchange() {
		const url = new URL(page.url.href);
		const { targetPath } = await completeLoginCallback(url, fetch);
		await goto(targetPath, { replaceState: true });
	}

	let loginResult: Promise<void> | null = $state(null);

	onMount(() => {
		loginResult = doPkceExchange();
	});
</script>

<div class="flex h-screen w-full items-center justify-center">
	<div class="text-center">
		{#if loginResult}
			{#await loginResult}
				<div class="mb-4 text-4xl font-bold">Logging in...</div>
				<progress class="progress my-3 w-56 progress-primary"></progress>
				<p class="text-lg text-gray-600">You will be redirected shortly.</p>
			{:then _}
				<div class="mb-4 text-4xl font-bold text-green-600">Login Successful</div>
				<p class="text-lg text-gray-600">Redirecting...</p>
			{:catch error}
				<div class="mb-4 text-4xl font-bold text-red-600">Login Failed</div>
				<p class="text-lg text-base-content">{error.message}</p>

				<a class="btn mt-4 btn-outline btn-primary" href={resolve('oauth/login')}>Try Again</a>
			{/await}
		{/if}
	</div>
</div>
