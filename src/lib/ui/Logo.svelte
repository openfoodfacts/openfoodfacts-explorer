<script lang="ts">
	import { getWebsiteCtx } from '$lib/stores/website';
	import { WEBSITE_FLAVOR_METADATA, type WebsiteFlavor } from '$lib/flavor';

	let websiteCtx = getWebsiteCtx();

	let {
		class: className = '',
		mono = false,
		flavor
	}: {
		mono?: boolean;
		class?: string;
		flavor?: WebsiteFlavor;
	} = $props();

	// `flavor` prop overrides the global website context flavor, so callers can
	// render a specific product-type logo (e.g. on landing pages) without
	// mutating the shared context — the same lookup the product page relies on.
	let logoSuffix = $derived(
		WEBSITE_FLAVOR_METADATA[flavor ?? websiteCtx.flavor]?.reportFlavor ?? 'off'
	);
</script>

<picture class={className}>
	<source
		srcset={mono
			? `https://static.openfoodfacts.org/images/logos/${logoSuffix}-logo-horizontal-mono-white.svg`
			: `https://static.openfoodfacts.org/images/logos/${logoSuffix}-logo-horizontal-dark.svg`}
		media="(prefers-color-scheme: dark)"
	/>
	<img
		src={mono
			? `https://static.openfoodfacts.org/images/logos/${logoSuffix}-logo-horizontal-mono-black.svg`
			: `https://static.openfoodfacts.org/images/logos/${logoSuffix}-logo-horizontal-light.svg`}
		alt="OpenFoodFacts Explorer"
		class="h-full w-full object-contain"
	/>
</picture>
