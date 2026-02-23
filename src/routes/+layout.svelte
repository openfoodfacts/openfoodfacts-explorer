<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { Matomo } from '@sinnwerkstatt/sveltekit-matomo';

	import '../app.css';
	import 'leaflet/dist/leaflet.css';
	import '@fontsource-variable/plus-jakarta-sans';

	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/state';

	import Logo from '$lib/ui/Logo.svelte';
	import Navbar from '$lib/ui/Navbar.svelte';
	import Footer from '$lib/ui/Footer.svelte';
	import SearchBar from '$lib/ui/SearchBar.svelte';
	import Toast from '$lib/ui/Toast.svelte';
	import IconMdiCog from '@iconify-svelte/mdi/cog';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiMagnify from '@iconify-svelte/mdi/magnify';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiMenu from '@iconify-svelte/mdi/menu';
	import CompareFloatingButton from '$lib/ui/CompareFloatingButton.svelte';

	import { _, getLocaleFromNavigator, locale } from '$lib/i18n';
	import {
		IMAGE_HOST,
		KEYCLOAK_ACCOUNT_URL,
		MATOMO_HOST,
		MATOMO_SITE_ID,
		ROBOTOFF_URL
	} from '$lib/const';
	import { userInfo } from '$lib/stores/user';
	import { extractQuery } from '$lib/facets';
	import { dev } from '$app/environment';
	import type { LayoutProps } from './$types';
	import { setWebsiteCtx } from '$lib/stores/website';
	import { setToastCtx, type Toast as ToastType, type ToastContext } from '$lib/stores/toasts';
	import Shortcuts, { type Shortcut } from './Shortcuts.svelte';
	import { preferences, runPreferencesMigrations } from '$lib/settings';
	import { SvelteMap } from 'svelte/reactivity';
	import { shouldBeContainer } from '$lib/layout';
	import { resolve } from '$app/paths';

	// == Global website context setup ==
	let websiteCtx: { flavor: 'beauty' | 'food' | 'petfood' | 'product' } = $state({
		flavor: 'food'
	});
	setWebsiteCtx(() => websiteCtx);

	// == Global toast context setup ==
	let toasts = $state<ToastType[]>([]);
	let toastId = 0;

	function addToast(
		message: string,
		type: 'success' | 'error' | 'warning' | 'info' = 'info',
		duration: number = 5000
	) {
		const id = `toast-${++toastId}`;
		const toast: ToastType = { id, message, type, duration };

		toasts = [...toasts, toast];

		// Auto-remove toast after duration
		if (duration > 0) {
			setTimeout(() => {
				removeToast(id);
			}, duration);
		}

		return id;
	}

	function removeToast(id: string) {
		toasts = toasts.filter((toast) => toast.id !== id);
	}

	function clearAllToasts() {
		toasts = [];
	}

	const toastCtx: ToastContext = {
		get toasts() {
			return toasts;
		},
		success: (message: string, duration?: number) => addToast(message, 'success', duration),
		error: (message: string, duration?: number) => addToast(message, 'error', duration),
		warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
		info: (message: string, duration?: number) => addToast(message, 'info', duration),
		remove: removeToast,
		clear: clearAllToasts
	};
	setToastCtx(() => toastCtx);

	// == Global shortcuts context setup ==

	let shortcutsComp: Shortcuts;
	let shortcuts = new SvelteMap<string, Shortcut>([
		[
			'Shift+?',
			{
				description: 'Show this help modal',
				action: () => shortcutsComp.show()
			}
		]
		// Add more shortcuts here
	]);

	setContext('shortcuts', () => shortcuts);

	// Load OpenFoodFacts Web Components

	onMount(async () => {
		await import('@openfoodfacts/openfoodfacts-webcomponents');
	});

	// == Layout logic ==

	let searchQuery: string = $state('');

	let { children }: LayoutProps = $props();

	onMount(() => {
		// only inject the script on the client side
		injectSpeedInsights();
	});

	function updateSearchQuery(url: URL) {
		const q = url.searchParams.get('q') ?? '';
		searchQuery = extractQuery(q);
	}
	// update searchQuery when the ?q parameter changes
	$effect(() => {
		updateSearchQuery(page.url);
	});

	let isSearching = $state(false);

	async function gotoProductsSearch() {
		isSearching = true;
		await goto('/search?q=' + encodeURIComponent(searchQuery));
		isSearching = false;
	}

	let searchActive = $state(false);
	let accordionOpen = $state(false);
	const mobileMenuId = 'mobile-menu-panel';

	// Automatically close mobile menu on navigation
	$effect(() => {
		// track dependency
		const _ = page.url.pathname;
		accordionOpen = false;
	});

	let config: HTMLElement;

	onMount(() => {
		runPreferencesMigrations();
		const unsubscribe = locale.subscribe((locale) => {
			const lang = locale?.split('-')[0]?.toLowerCase();

			config.setAttribute('language-code', lang ?? 'en');
		});
		return () => {
			unsubscribe();
		};
	});

	// Track navigation time. If > 5s, show a popup suggesting server is slow or down
	let navigationTooSlow: Promise<void> | null = $state(null);
	$effect(() => {
		if (navigating.to != null) {
			navigationTooSlow = new Promise((resolve) => {
				const timeout = setTimeout(() => {
					resolve();
				}, 5000);

				return () => clearTimeout(timeout);
			});
		} else {
			navigationTooSlow = null;
		}
	});
</script>

<svelte:head>
	<title>OFF Explorer</title>
	<meta name="description" content="Open Food Facts Explorer" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<Matomo url={MATOMO_HOST} siteId={MATOMO_SITE_ID} />

<Shortcuts {shortcuts} bind:this={shortcutsComp} />

<div class="hidden">
	<!-- Global OpenFoodFacts Web Components Configuration -->
	<off-webcomponents-configuration
		bind:this={config}
		language-code={$preferences.lang ??
			getLocaleFromNavigator()?.split('-')[0]?.toLowerCase() ??
			'en'}
		assets-images-path="/assets/webcomponents"
		robotoff-configuration={JSON.stringify({
			dryRun: !dev,
			apiUrl: ROBOTOFF_URL + '/api/v1',
			imgUrl: IMAGE_HOST + '/images/products'
		})}
	>
	</off-webcomponents-configuration>
</div>

{#if navigating.to != null}
	<progress class="progress progress-secondary fixed top-0 left-0 z-50 h-1 w-full rounded-none"
	></progress>
{/if}

<!-- Desktop Header -->
<div class="hidden xl:block">
	<div class="flex justify-center">
		<div class="bg-base-100 navbar flex max-w-7xl px-10">
			<div class="navbar-start">
				<a href="/"> <Logo /> </a>
			</div>
			<div class="navbar-center">
				<SearchBar bind:searchQuery onSearch={gotoProductsSearch} loading={isSearching} />
			</div>
			<div class="navbar-end gap-2">
				{#if $userInfo != null}
					<a
						class="btn btn-outline link"
						href={resolve('/users/[user]', { user: $userInfo.preferred_username })}>Account</a
					>
					<a class="btn btn-outline link" href={resolve('/oauth/logout')}>Log out</a>
				{:else}
					<a class="btn btn-outline link" href={resolve('/oauth/login')}> Login </a>
				{/if}
				<!-- Settings button -->
				<a
					class="btn btn-ghost link"
					href={resolve('/settings')}
					aria-label={$_('settings_link')}
					title={$_('settings_link')}
				>
					<IconMdiCog class="w-6" />
				</a>
				<!-- Shortcuts button -->
				<button
					class="btn btn-ghost"
					title={$_('help.button')}
					aria-label={$_('help.button')}
					onclick={() => shortcutsComp.show()}
				>
					<IconMdiHelpCircleOutline class="w-6" />
				</button>
			</div>
		</div>
	</div>

	<!-- Only show Navbar on lg and up -->
	<div>
		<Navbar />
	</div>
</div>

<!-- Mobile Header -->
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
				<IconMdiMagnify class="h-5 w-5" />
			</button>
			<button
				type="button"
				title={$_('menu.button')}
				aria-label={$_('menu.button')}
				aria-expanded={accordionOpen}
				aria-controls={mobileMenuId}
				class="btn btn-square btn-secondary text-lg"
				onclick={() => {
					accordionOpen = !accordionOpen;
				}}
				onkeydown={(e) => {
					if (e.key === 'Escape') accordionOpen = false;
				}}
			>
				{#if accordionOpen}
					<IconMdiClose class="h-5 w-5" />
				{:else}
					<IconMdiMenu class="h-5 w-5" />
				{/if}
			</button>
		</div>
	</div>

	{#if searchActive}
		<div class="flex justify-center">
			<SearchBar bind:searchQuery onSearch={gotoProductsSearch} loading={isSearching} />
		</div>
	{/if}
	<div
		id={mobileMenuId}
		role="region"
		aria-label={$_('menu.mobile_nav', { default: 'Mobile navigation menu' })}
		class:hidden={!accordionOpen}
		class="mt-3 flex flex-col gap-2 md:flex-row md:flex-wrap md:justify-center"
	>
		<a class="btn btn-outline link" href="/static/discover">
			{$_('discover_link')}
		</a>
		<a class="btn btn-outline link" href="/static/contribute">
			{$_('contribute_link')}
		</a>
		<a class="btn btn-outline link" href="/static/producers">
			{$_('producers_link')}
		</a>
		<a class="btn btn-outline link" href="https://prices.openfoodfacts.org">
			{$_('prices_link')}
		</a>
		<a class="btn btn-outline link" href="/folksonomy">
			{$_('folksonomy_link')}
		</a>
		<a class="btn btn-outline link" href="/facets">
			{$_('facets_link')}
		</a>

		<div class="divider md:divider-horizontal"></div>
		<a
			class="btn btn-outline link"
			href="/settings"
			title={$_('settings_link')}
			aria-label={$_('settings_link')}
		>
			{$_('settings_link')}
		</a>

		{#if $userInfo != null}
			<a class="btn btn-outline link" href={KEYCLOAK_ACCOUNT_URL}>Account</a>
			<a class="btn btn-outline link" href={resolve('/oauth/logout')}>Log out</a>
		{:else}
			<a class="btn btn-outline link" href={resolve('/oauth/login')}> Login </a>
		{/if}
	</div>
</div>

{#if shouldBeContainer(page.url.pathname)}
	<div class="w-full">
		{@render children?.()}
	</div>
{:else}
	<div class="container mx-auto my-2 gap-4 px-4 xl:max-w-6xl">
		{@render children?.()}
	</div>
{/if}
<CompareFloatingButton />
<Footer />
<Toast />

{#if navigationTooSlow != null}
	{#await navigationTooSlow then}
		<dialog id="slow-server-dialog" class="modal" open>
			<div class="modal-box">
				<h3 class="text-lg font-bold">
					{$_('slow_server.title', { default: 'This is taking longer than expected...' })}
				</h3>
				<p class="py-4">
					{$_('slow_server.message', {
						default:
							'Check your internet connection and our status page to see if there are any ongoing issues.'
					})}
				</p>
				<div class="modal-action">
					<a href="https://status.openfoodfacts.org" target="_blank" class="btn btn-primary">
						{$_('slow_server.status_page', { default: 'View Status Page' })}
					</a>
				</div>
			</div>
		</dialog>
	{/await}
{/if}
