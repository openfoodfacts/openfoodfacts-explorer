<script lang="ts">
	import { getWebsiteCtx } from '$lib/stores/website';
	import { WEBSITE_FLAVOR_METADATA } from '$lib/flavor';

	let websiteCtx = getWebsiteCtx();

	let logoSuffix = $derived(WEBSITE_FLAVOR_METADATA[websiteCtx.flavor]?.reportFlavor ?? 'off');
	let {
		class: className = '',
		mono = false
	}: {
		mono?: boolean;
		class?: string;
	} = $props();
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
