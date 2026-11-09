<script lang="ts">
	import { getWebsiteCtx } from '#lib/stores/website.js';
	import { WEBSITE_FLAVOR_METADATA } from '#lib/flavor.js';
	import { STATIC_HOST } from '#lib/const.js';

	let websiteCtx = getWebsiteCtx();

	let {
		class: className = '',
		mono = false,
		fetchpriority
	}: {
		mono?: boolean;
		fetchpriority?: 'high' | 'low' | 'auto';
		class?: string;
	} = $props();

	let logoSuffix = $derived(WEBSITE_FLAVOR_METADATA[$websiteCtx.flavor]?.reportFlavor ?? 'off');
	let logoBaseUrl = $derived(`${STATIC_HOST}/images/logos/${logoSuffix}-logo-horizontal`);
	let darkLogoUrl = $derived(`${logoBaseUrl}-${mono ? 'mono-white' : 'dark'}.svg`);
	let lightLogoUrl = $derived(`${logoBaseUrl}-${mono ? 'mono-black' : 'light'}.svg`);
</script>

<picture class={className}>
	<source srcset={darkLogoUrl} media="(prefers-color-scheme: dark)" />
	<img
		src={lightLogoUrl}
		{fetchpriority}
		alt="OpenFoodFacts Explorer"
		class="h-full w-full object-contain"
	/>
</picture>
