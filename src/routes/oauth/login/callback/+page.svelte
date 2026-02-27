<script lang="ts">
	import { page } from '$app/state';

	import { saveAuthTokens } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createKeycloakApi } from '$lib/api';
	import { browser } from '$app/environment';
	import { untrack } from 'svelte';

	async function doPkceExchange() {
		const url = page.url;

		const returnedState = url.searchParams.get('state');
		const storedState = localStorage.getItem('authState');

		if (!returnedState || returnedState !== storedState) {
			console.error('State validation failed');
			throw new Error('Authentication failed: Invalid state parameter');
		}

		localStorage.removeItem('authState');

		const verifier = localStorage.getItem('verifier');
		const code = url.searchParams.get('code');

		if (!verifier) {
			console.error('Missing PKCE verifier in localStorage');
			throw new Error('Authentication failed: Missing PKCE verifier');
		}
		if (!code) {
			console.error('Missing authorization code in URL');
			throw new Error('Authentication failed: Missing authorization code');
		}

		try {
			const jwt = await createKeycloakApi(fetch, url).exchangeCode({
				code,
				verifier
			});
			localStorage.removeItem('verifier');
			saveAuthTokens(jwt);
			await goto(resolve('/'));
		} catch (error) {
			console.error('Token exchange failed:', error);
			throw new Error('Authentication failed: Token exchange error');
		}
	}

	let loginResult: Promise<void> | null = $derived(browser ? untrack(doPkceExchange) : null);
</script>

<div class="flex h-screen w-full items-center justify-center">
	<div class="text-center">
		{#if loginResult}
			{#await loginResult}
				<div class="mb-4 text-4xl font-bold">Logging in...</div>
				<progress class="progress progress-primary my-3 w-56"></progress>
				<p class="text-lg text-gray-600">You will be redirected shortly.</p>
			{:then _}
				<div class="mb-4 text-4xl font-bold text-green-600">Login Successful</div>
				<p class="text-lg text-gray-600">Redirecting to the homepage...</p>
			{:catch error}
				<div class="mb-4 text-4xl font-bold text-red-600">Login Failed</div>
				<p class="text-base-content text-lg">{error.message}</p>
				<a class="btn btn-outline btn-primary mt-4" href={resolve('/oauth/login')}> Try Again </a>
			{/await}
		{/if}
	</div>
</div>
