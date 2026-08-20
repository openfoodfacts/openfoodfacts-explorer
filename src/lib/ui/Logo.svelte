<script lang="ts">
	import { onMount } from 'svelte';
	import { getWebsiteCtx } from '$lib/stores/website';
	import { WEBSITE_FLAVOR_METADATA } from '$lib/flavor';
	import { preferences } from '$lib/settings';

	let websiteCtx = getWebsiteCtx();

	let logoSuffix = $derived(WEBSITE_FLAVOR_METADATA[$websiteCtx.flavor]?.reportFlavor ?? 'off');

	let isSystemDark = $state(false);

	onMount(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		isSystemDark = mediaQuery.matches;

		const update = (event: MediaQueryListEvent) => {
			isSystemDark = event.matches;
		};

		mediaQuery.addEventListener('change', update);

		return () => mediaQuery.removeEventListener('change', update);
	});

	let isDark = $derived(
		$preferences.theme === 'dark' || ($preferences.theme === 'system' && isSystemDark)
	);

	let {
		class: className = '',
		mono = false
	}: {
		mono?: boolean;
		class?: string;
	} = $props();

	let logoSrc = $derived(
		mono
			? isDark
				? `https://static.openfoodfacts.org/images/logos/${logoSuffix}-logo-horizontal-mono-white.svg`
				: `https://static.openfoodfacts.org/images/logos/${logoSuffix}-logo-horizontal-mono-black.svg`
			: isDark
				? `https://static.openfoodfacts.org/images/logos/${logoSuffix}-logo-horizontal-dark.svg`
				: `https://static.openfoodfacts.org/images/logos/${logoSuffix}-logo-horizontal-light.svg`
	);
</script>

<picture class={className}>
	<img src={logoSrc} alt="OpenFoodFacts Explorer" class="h-full w-full object-contain" />
</picture>
