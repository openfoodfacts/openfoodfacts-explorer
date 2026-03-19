<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	// import { Matomo } from '@sinnwerkstatt/sveltekit-matomo';

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
	import { IMAGE_HOST, MATOMO_HOST, MATOMO_SITE_ID, ROBOTOFF_URL } from '$lib/const';
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

	let websiteCtx: { flavor: 'beauty' | 'food' | 'petfood' | 'product' } = $state({
		flavor: 'food'
	});
	setWebsiteCtx(() => websiteCtx);

	let toasts = $state<ToastType[]>([]);
	let toastId = 0;

	function addToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000) {
		const id = `toast-${++toastId}`;
		const toast: ToastType = { id, message, type, duration };
		toasts = [...toasts, toast];

		if (duration > 0) {
			setTimeout(() => removeToast(id), duration);
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
		get toasts() { return toasts; },
		success: (m, d) => addToast(m, 'success', d),
		error: (m, d) => addToast(m, 'error', d),
		warning: (m, d) => addToast(m, 'warning', d),
		info: (m, d) => addToast(m, 'info', d),
		remove: removeToast,
		clear: clearAllToasts
	};
	setToastCtx(() => toastCtx);

	let shortcutsComp: Shortcuts;
	let shortcuts = new SvelteMap<string, Shortcut>([
		['Shift+?', { description: 'Show this help modal', action: () => shortcutsComp.show() }]
	]);
	setContext('shortcuts', () => shortcuts);

	onMount(async () => {
		await import('@openfoodfacts/openfoodfacts-webcomponents');
	});

	let searchQuery: string = $state('');
	let { children }: LayoutProps = $props();

	onMount(() => {
		injectSpeedInsights();
	});

	function updateSearchQuery(url: URL) {
		searchQuery = extractQuery(url.searchParams.get('q') ?? '');
	}

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

	$effect(() => {
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
		return () => unsubscribe();
	});

	let navigationTooSlow: Promise<void> | null = $state(null);

	$effect(() => {
		if (navigating.to != null) {
			let timeout: ReturnType<typeof setTimeout>;
			navigationTooSlow = new Promise((resolve) => {
				timeout = setTimeout(resolve, 5000);
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

<!-- Matomo disabled -->
<!-- <Matomo url={MATOMO_HOST} siteId={MATOMO_SITE_ID} /> -->

<Shortcuts {shortcuts} bind:this={shortcutsComp} />

<!-- rest of your UI remains unchanged -->

<slot />