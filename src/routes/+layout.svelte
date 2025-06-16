<script lang="ts">
	import Logo from '$lib/ui/Logo.svelte';
	import Footer from '$lib/ui/Footer.svelte';
	import NutritionCalculator from '$lib/ui/NutritionCalculator.svelte';

	import '../app.css';
	import 'leaflet/dist/leaflet.css';
	import '@fontsource-variable/plus-jakarta-sans';
	import { initI18n, _, isLoading } from '$lib/i18n';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import Navbar from '$lib/ui/Navbar.svelte';

	onMount(async () => {
		await import('@openfoodfacts/openfoodfacts-webcomponents');
	});

	// Initialize i18n
	initI18n();

	let searchQuery: string = $state('');

	const GITHUB_REPO_URL = 'https://github.com/openfoodfacts/openfoodfacts-explorer';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		// only inject the script on the client side
		injectSpeedInsights();
	});

	function updateSearchQuery(url: URL) {
		searchQuery = url.searchParams.get('q') ?? '';
	}
	// update searchQuery when the ?q parameter changes
	$effect(() => {
		updateSearchQuery(page.url);
	});

	function gotoProductsSearch() {
		goto('/products/search?q=' + searchQuery);
	}

	let searchActive = $state(false);
	let accordionOpen = $state(false);

	// TODO: update this propertly
	let userLoginState = false;

	// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	const keycloak = 'http://auth.openfoodfacts.localhost:5600/realms/open-products-facts';
	const pkceClientId = 'OFF_EXP';


	function base64URLEncode(bytes: any) {
		const b64 = btoa(String.fromCodePoint(...bytes));
		const encoded = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
		return encoded;
	}

	async function pkceLogin() {
		const verifier = base64URLEncode(crypto.getRandomValues(new Uint8Array(32)));
		// Save the verifier so that the code page can access it
		// Should really use sessionStorage but for tests when we click a verification email that starts a separate session
		localStorage.setItem('verifier', verifier);
		const codeChallenge = base64URLEncode(
			new Uint8Array(
				await crypto.subtle.digest({ name: 'SHA-256' }, new TextEncoder().encode(verifier))
			)
		);

		const nonce = crypto.getRandomValues(new BigUint64Array(1))[0];
		const lang = "en";
		const clientSecret = '1';

		const redirectUri = `http://localhost:5604/${page}.html?clientId=${clientId}&pkceClientId=${pkceClientId}&clientSecret=${clientSecret}&lang=${lang}&keycloak=${encodeURIComponent(keycloak)}&mode=pkce`;

		const url = `${keycloak}/protocol/openid-connect/auth?response_type=code&client_id=${pkceClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid+profile+offline_access&state=${nonce}&ui_locales=${lang}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

		userLoginState = true; // Set user login state to true
		window.location.href = url;
	}

	async function getAccessToken() {
		const verifier = localStorage.getItem("verifier");
		const body = new URLSearchParams({
			code: "code", // figure this out
			grant_type: "authorization_code",
			redirect_uri: "http://localhost:5173/accesstoken.html",
			client_id: pkceClientId,
			code_verifier: verifier ?? ''
		});
		const response = await fetch(`${keycloak}/protocol/openid-connect/token`, {
			method: "POST",
			body: body,
			headers: new Headers(),
		});
		const jwt = await response.json();
		const accessToken = JSON.parse(atob(jwt.access_token.split(".")[1]));
		return {
			accessToken: jwt.access_token,
			idToken: jwt.id_token,
			expiresIn: jwt.expires_in,
			accessTokenPayload: accessToken
		};
	}

	async function logoutUser() {
		const { idToken } = await getAccessToken();
		const redirectUri = `http://localhost:5604/logout.html`;
		userLoginState = false; // Set user login state to false

		window.location.href = `${keycloak}/protocol/openid-connect/logout?client_id=${pkceClientId}&post_logout_redirect_uri=${encodeURIComponent(redirectUri)}&id_token_hint=${idToken}`;
	}

	function getAccountUrl() {
		return `${keycloak}/account/#/`;
	}
	
	// const authUrl = `http://auth.openfoodfacts.localhost:5600/realms/open-products-facts/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirect_uri}&state=de8df7a8-a591-4f38-908d-d7340ce7e04e&response_mode=query&response_type=code&scope=openid&nonce=20bf70cc-6d3a-48df-ab62-6dd053cfa582&code_challenge=${codeChallenge}&code_challenge_method=S256`;

	// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
</script>

<svelte:head>
	<title>OFF Explorer</title>
	<meta name="description" content="Open Food Facts Explorer" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

{#if !$isLoading}
	<!-- Global OpenFoodFacts Web Components Configuration -->
	<off-webcomponents-configuration language-code="en" assets-images-path="assets/webcomponents">
	</off-webcomponents-configuration>

	<div class="flex justify-center">
		<div class="bg-base-100 navbar hidden max-w-7xl px-10 xl:flex">
			<div class="navbar-start">
				<a href="/"> <Logo /> </a>
			</div>
			<div class="navbar-center">
				<div class="form-control">
					<div>
						<div class="join">
							<input
								type="text"
								bind:value={searchQuery}
								class="input join-item input-bordered xl:w-full"
								placeholder={$_('search.placeholder')}
								onkeydown={(e) => {
									if (e.key === 'Enter' && searchQuery.trim() !== '') {
										gotoProductsSearch();
									}
								}}
							/>
							<button
								class="btn btn-square btn-secondary join-item px-10"
								onclick={() => gotoProductsSearch()}
								disabled={searchQuery == null || searchQuery.trim() === ''}
							>
								{$_('search.go')}
							</button>
						</div>

						<a
							class="btn btn-secondary ms-4 px-5 text-lg"
							href="/qr"
							title={$_('search.scan')}
							aria-label={$_('search.scan')}
						>
							<span class="icon-[mdi--barcode-scan] h-6 w-6"></span>
						</a>
					</div>
				</div>
			</div>

			<div class="navbar-end gap-2">
				<NutritionCalculator />
				<a class="btn btn-outline link" href="/settings">{$_('settings_link')}</a>
				<a
					class="btn btn-outline link"
					href={GITHUB_REPO_URL}
					target="_blank"
					aria-label={$_('github_link')}
				>
					<span class="icon-[mdi--github] h-8 w-8"></span>
				</a>
				{#if userLoginState}
					<a class="btn btn-outline link" href={getAccountUrl()}>Account</a>
					<button
						class="btn btn-outline link logout-btn"
						onclick={logoutUser}>Log out</button
					>
				{:else}
					<!-- svelte-ignore a11y_missing_attribute -->
					<a class="btn btn-outline link">
						<button onclick={pkceLogin}> Login </button>
					</a>
				{/if}
			</div>
		</div>
	</div>

	<!-- Only show Navbar on lg and up -->
	<div class="hidden xl:block">
		<Navbar />
	</div>

	<div class="bg-base-100 top-0 right-0 left-0 z-50 mx-4 xl:hidden">
		<div class="navbar bg-base-100 mx-auto mt-2 mb-2 px-0">
			<div class="navbar-start">
				<a href="/">
					<Logo />
				</a>
			</div>
			<div class="navbar-end flex gap-1 sm:gap-2">
				<button
					aria-label={$_('search.button')}
					class="btn btn-square btn-secondary text-lg"
					onclick={() => {
						searchActive = !searchActive;
					}}
				>
					<i class="icon-[mdi--magnify]"></i>
				</button>
				<button
					class="btn btn-square btn-secondary text-lg"
					onclick={() => {
						accordionOpen = !accordionOpen;
					}}
				>
					{#if accordionOpen}
						<i class="icon-[mdi--close]"></i>
					{:else}
						<i class="icon-[mdi--menu]"></i>
					{/if}
				</button>
			</div>
		</div>
		{#if searchActive}
			<div class="-mt-2 flex items-center gap-1 sm:gap-2">
				<div class="join w-full">
					<input
						type="text"
						bind:value={searchQuery}
						class="input join-item input-bordered w-full"
						placeholder={$_('search.placeholder')}
						onkeydown={(e) => {
							if (e.key === 'Enter' && searchQuery.trim() !== '') {
								gotoProductsSearch();
							}
						}}
					/>
					<button
						class="btn btn-square btn-secondary join-item"
						onclick={() => gotoProductsSearch()}
						disabled={searchQuery == null || searchQuery.trim() === ''}
					>
						{$_('search.go')}
					</button>
				</div>
				<a
					class="btn btn-square btn-secondary text-lg"
					href="/qr"
					title={$_('search.scan')}
					aria-label={$_('search.scan')}
				>
					<span class="icon-[mdi--barcode-scan] h-6 w-6"></span>
				</a>
			</div>
		{/if}
		<div
			class:hidden={!accordionOpen}
			class="mt-3 flex flex-col gap-2 md:flex-row md:flex-wrap md:justify-center"
		>
			<a class="btn btn-outline link" href="/folksonomy">
				{$_('folksonomy_link')}
			</a>
			<a class="btn btn-outline link" href="/settings">
				{$_('settings_link')}
			</a>
			<a class="btn btn-outline link" href="#">
				{$_('discover_link')}
			</a>
			<a class="btn btn-outline link" href="#">
				{$_('contribute_link')}
			</a>
			<a class="btn btn-outline link" href="#">
				{$_('producers_link')}
			</a>
			<a class="btn btn-outline link" href="#">
				{$_('prices_link')}
			</a>
			<a
				class="btn btn-outline link"
				href={GITHUB_REPO_URL}
				target="_blank"
				aria-label={$_('github_link')}
			>
				<span class="icon-[mdi--github] h-8 w-8"></span>
			</a>
		</div>
	</div>

	<div class="container mx-auto my-2 gap-4 px-4 xl:max-w-6xl">
		{@render children?.()}
	</div>
	<NutritionCalculator />
	<Footer />
{:else}
	<div class="py-10 text-center text-xl font-medium">Loading translations...</div>
{/if}
