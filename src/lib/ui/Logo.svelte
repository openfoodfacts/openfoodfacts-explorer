<script lang="ts">
	import { getWebsiteCtx } from '$lib/stores/website';

	let websiteCtx = getWebsiteCtx();

	const FLAVOR_MAP: Record<typeof websiteCtx.flavor, string> = {
		beauty: 'obf',
		food: 'off',
		petfood: 'opff',
		product: 'opf'
	};

	let logoSuffix = $derived(FLAVOR_MAP[websiteCtx.flavor] ?? 'off');
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
