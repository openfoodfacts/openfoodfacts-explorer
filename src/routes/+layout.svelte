<script lang="ts">
	import { onMount } from 'svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { Matomo } from '$lib/matomo';

	import '../app.css';
	import 'leaflet/dist/leaflet.css';
	import '@fontsource-variable/plus-jakarta-sans';

	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { slide } from 'svelte/transition';

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
	import IconMdiLogin from '@iconify-svelte/mdi/login';
	import IconMdiLogout from '@iconify-svelte/mdi/logout';
	import IconMdiAccountCircle from '@iconify-svelte/mdi/account-circle';
	import CompareFloatingButton from '$lib/ui/CompareFloatingButton.svelte';

	import { _, getLocale, locale } from '$lib/i18n';
	import {
		IMAGE_HOST,
		MATOMO_HOST,
		MATOMO_SITE_ID,
		OPEN_PRICES_BASE_URL,
		ROBOTOFF_URL
	} from '$lib/const';
	import { userInfo } from '$lib/stores/user';
	import { extractQuery } from '$lib/facets';
	import { dev } from '$app/environment';
	import type { LayoutProps } from './$types';
	import { setWebsiteCtx } from '$lib/stores/website';
	import type { WebsiteFlavor } from '$lib/flavor';
	import { setToastCtx, type Toast as ToastType, type ToastContext } from '$lib/stores/toasts';
	import Shortcuts from './Shortcuts.svelte';
	import { setShortcutCtx, type Shortcut } from '$lib/stores/shortcuts';
	import { preferences, runPreferencesMigrations } from '$lib/settings';
	import { SvelteMap } from 'svelte/reactivity';
	import { shouldBeContainer } from '$lib/layout';
	import { resolve } from '$app/paths';

	// == Global website context setup ==
	let websiteCtx: { flavor: WebsiteFlavor } = $state({
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

	setShortcutCtx(() => shortcuts);

	// Load OpenFoodFacts Web Components

	onMount(async () => {
		await import('@openfoodfacts/openfoodfacts-webcomponents');
	});

	// == Global User Permissions Context ==

	import { setPermissionsCtx, type UserPermissionsContext } from '$lib/stores/user';
	import { fetchCurrentUserPermissions } from '$lib/api/permissions';
	import { CURRENT_USER_PERMISSIONS_URL } from '$lib/const';
	import { wrapFetchWithAuth } from '$lib/stores/auth';

	let permissionsCtx = $state<UserPermissionsContext>({
		isAdmin: false,
		isModerator: false
	});

	setPermissionsCtx(() => permissionsCtx);

	$effect(() => {
		// Runs whenever the derived $userInfo changes (i.e. user logs in or logs out)
		if ($userInfo && $userInfo.preferred_username) {
			const authFetch = wrapFetchWithAuth(globalThis.fetch);
			fetchCurrentUserPermissions(authFetch, CURRENT_USER_PERMISSIONS_URL).then(
				(permissionsData) => {
					if (permissionsData && permissionsData.status === 'success' && permissionsData.user) {
						permissionsCtx.isAdmin = permissionsData.user.admin === 1;
						permissionsCtx.isModerator = permissionsData.user.moderator === 1;
					} else {
						permissionsCtx.isAdmin = false;
						permissionsCtx.isModerator = false;
					}
				}
			);
		} else {
			// Clear roles when logged out
			permissionsCtx.isAdmin = false;
			permissionsCtx.isModerator = false;
		}
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

	function getLoginUrl(url: URL) {
		return resolve('/oauth/login') + '?redirect=' + encodeURIComponent(url.pathname + url.search);
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
			let timeout: ReturnType<typeof setTimeout>;

			navigationTooSlow = new Promise((resolve) => {
				timeout = setTimeout(() => {
					resolve();
				}, 5000);
			});

			return () => clearTimeout(timeout);
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
		language-code={$preferences.lang ?? getLocale()?.split('-')[0]?.toLowerCase() ?? 'en'}
		assets-images-path="/assets/webcomponents"
		robotoff-configuration={JSON.stringify({
			dryRun: dev,
			apiUrl: ROBOTOFF_URL + '/api/v1',
			imgUrl: IMAGE_HOST + '/images/products'
		})}
	>
	</off-webcomponents-configuration>
</div>

{#if navigating.to != null}
	<progress class="progress fixed top-0 left-0 z-50 h-1 w-full rounded-none progress-secondary"
	></progress>
{/if}

<!-- Desktop Header -->
<div class="hidden xl:block">
	<div class="flex justify-center">
		<div class="navbar flex max-w-7xl bg-base-100 px-10">
			<div class="navbar-start">
				<a href="/"> <Logo /> </a>
			</div>
			<div class="navbar-center">
				<SearchBar bind:searchQuery onSearch={gotoProductsSearch} loading={isSearching} />
			</div>
			<div class="navbar-end gap-2">
				<!-- Shortcuts button -->
				<button
					class="btn btn-ghost"
					title={$_('help.button')}
					aria-label={$_('help.button')}
					onclick={() => shortcutsComp.show()}
				>
					<IconMdiHelpCircleOutline class="w-6" />
				</button>
				<!-- Settings button -->
				<a
					class="btn link btn-ghost"
					href={resolve('/settings')}
					aria-label={$_('settings_link')}
					title={$_('settings_link')}
				>
					<IconMdiCog class="w-6" />
				</a>
				{#if $userInfo != null}
					<div class="dropdown dropdown-end">
						<div tabindex="0" role="button" class="btn btn-ghost">
							<IconMdiAccountCircle class="h-6 w-6 text-secondary" />
						</div>
						<ul
							class="dropdown-content menu z-50 mt-1 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
						>
							<li
								class="menu-title px-4 py-2 text-xs font-semibold tracking-wider text-base-content/60 uppercase"
							>
								{$_('navbar.welcome', { default: 'User Menu' })}
							</li>
							<li>
								<a
									href={resolve('/users/[user]', { user: $userInfo.preferred_username })}
									class="flex gap-2 px-4 py-2 hover:bg-base-200 hover:text-base-content active:bg-primary active:text-primary-content"
								>
									<IconMdiAccountCircle class="h-5 w-5" />
									<span>{$_('navbar.account', { default: 'Account' })}</span>
								</a>
							</li>
							<div class="divider my-1"></div>
							<li>
								<a
									href={resolve('/oauth/logout')}
									class="flex gap-2 px-4 py-2 text-error hover:bg-error/10 active:bg-error active:text-error-content"
								>
									<IconMdiLogout class="h-5 w-5" />
									<span>{$_('navbar.logout', { default: 'Logout' })}</span>
								</a>
							</li>
						</ul>
					</div>
				{:else}
					<a
						rel="external"
						class="btn gap-2 rounded-full border-base-300 btn-outline px-4 transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-content"
						href={getLoginUrl(page.url)}
					>
						<IconMdiLogin class="h-5 w-5" />
						<span>{$_('navbar.login', { default: 'Login' })}</span>
					</a>
				{/if}
			</div>
		</div>
	</div>

	<!-- Only show Navbar on lg and up -->
	<div>
		<Navbar />
	</div>
</div>

<!-- Mobile Header -->
<div class="top-0 right-0 left-0 z-50 mx-4 mb-2 bg-base-100 xl:hidden">
	<div class="navbar mx-auto mt-2 mb-2 bg-base-100 px-0">
		<div class="navbar-start">
			<a href="/">
				<Logo />
			</a>
		</div>
		<div class="navbar-end flex gap-1 sm:gap-2">
			<button
				aria-label={$_('search.button')}
				class="btn btn-square text-lg btn-secondary"
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
				class="btn btn-square text-lg btn-secondary"
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
		<div class="flex justify-center" transition:slide={{ duration: 200 }}>
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
		<a class="btn link btn-outline" href="/static/discover">
			{$_('discover_link')}
		</a>
		<a class="btn link btn-outline" href="/static/contribute">
			{$_('contribute_link')}
		</a>
		<a class="btn link btn-outline" href="/static/producers">
			{$_('producers_link')}
		</a>
		<a class="btn link btn-outline" href={OPEN_PRICES_BASE_URL}>
			{$_('prices_link')}
		</a>
		<a class="btn link btn-outline" href="/folksonomy">
			{$_('folksonomy_link')}
		</a>
		<a class="btn link btn-outline" href="/facets">
			{$_('facets_link')}
		</a>

		<div class="divider md:divider-horizontal"></div>
		<a
			class="btn link btn-outline"
			href="/settings"
			title={$_('settings_link')}
			aria-label={$_('settings_link')}
		>
			{$_('settings_link')}
		</a>

		{#if $userInfo != null}
			<div class="mt-2 flex w-full justify-center md:mt-0">
				<div
					class="flex w-full flex-col gap-2 rounded-box border border-base-300 bg-base-200 p-2 md:w-auto"
				>
					<div class="flex items-center gap-3 px-2 py-1.5">
						<IconMdiAccountCircle class="h-6 w-6 text-secondary" />
						<span class="truncate text-sm font-semibold text-base-content"
							>{$userInfo.preferred_username}</span
						>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<a
							class="btn gap-2 btn-outline btn-sm"
							href={resolve('/users/[user]', { user: $userInfo.preferred_username })}
						>
							<IconMdiAccountCircle class="h-4 w-4" />
							<span>{$_('navbar.account', { default: 'Account' })}</span>
						</a>
						<a class="btn gap-2 btn-outline btn-error btn-sm" href={resolve('/oauth/logout')}>
							<IconMdiLogout class="h-4 w-4" />
							<span>{$_('navbar.logout', { default: 'Logout' })}</span>
						</a>
					</div>
				</div>
			</div>
		{:else}
			<a
				rel="external"
				class="btn gap-2 rounded-full btn-outline px-5 transition-all duration-300 hover:bg-primary hover:text-primary-content"
				href={getLoginUrl(page.url)}
			>
				<IconMdiLogin class="h-5 w-5" />
				<span>{$_('navbar.login', { default: 'Login' })}</span>
			</a>
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
					<a
						href="https://status.openfoodfacts.org"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-primary"
					>
						{$_('slow_server.status_page', { default: 'View Status Page' })}
					</a>
				</div>
			</div>
		</dialog>
	{/await}
{/if}
