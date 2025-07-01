<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import Logo from '$lib/ui/Logo.svelte';
	import Navbar from '$lib/ui/Navbar.svelte';
	import Footer from '$lib/ui/Footer.svelte';
	import NutritionCalculator from '$lib/ui/NutritionCalculator.svelte';
	import '../app.css';
	import 'leaflet/dist/leaflet.css';
	import '@fontsource-variable/plus-jakarta-sans';
	import { userLoginState } from '$lib/stores/userStore';
	import { userAuthTokens } from '$lib/stores/pkceLoginStore';
	import { ACCOUNT_URL } from '$lib/const';
	import SearchBar from '$lib/ui/SearchBar.svelte';
	import { initI18n, _, isLoading } from '$lib/i18n';
	import { Matomo } from '@sinnwerkstatt/sveltekit-matomo';

	import '../app.css';
	import 'leaflet/dist/leaflet.css';
	import '@fontsource-variable/plus-jakarta-sans';

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

		let accessToken = '';
		let refreshToken = '';

		// check if the user is logged in based on the access tokens
		userAuthTokens.subscribe((tokens) => {
			accessToken = tokens.accessToken;
			refreshToken = tokens.refreshToken;
		})();

		if (accessToken) {
			userLoginState.set(true);
		} else {
			userLoginState.set(false);
		}
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
</script>

<svelte:head>
	<title>OFF Explorer</title>
	<meta name="description" content="Open Food Facts Explorer" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<Matomo url="https://analytics.openfoodfacts.org" siteId={17} />

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
				<SearchBar bind:searchQuery onSearch={gotoProductsSearch} />
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
				{#if $userLoginState}
					<a class="btn btn-outline link" href={ACCOUNT_URL}>Account</a>
					<a class="btn btn-outline link" href="/logout">Log out</a>
				{:else}
					<a class="btn btn-outline link" href="/login"> Login </a>
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
			<div class="flex justify-center">
				<SearchBar bind:searchQuery onSearch={gotoProductsSearch} />
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
			<a class="btn btn-outline link" href="/discover">
				{$_('discover_link')}
			</a>
			<a class="btn btn-outline link" href="/contribute">
				{$_('contribute_link')}
			</a>
			<a class="btn btn-outline link" href="#">
				{$_('producers_link')}
			</a>
			<a class="btn btn-outline link" href="#">
				{$_('prices_link')}
			</a>
			{#if $userLoginState}
				<a class="btn btn-outline link" href={ACCOUNT_URL}>
					{$_('account_link')}
				</a>
				<a class="btn btn-outline link" href="/logout">
					{$_('logout_link')}
				</a>
			{:else}
				<a class="btn btn-outline link" href="/login">
					{$_('login_link')}
				</a>
			{/if}
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
