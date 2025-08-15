<script lang="ts">
	type Flavor = 'beauty' | 'food' | 'petfood' | 'product';
	let { flavor }: { flavor: Flavor } = $props();

	const FLAVOR_MAP: Record<Flavor, string> = {
		beauty: 'obf',
		food: 'off',
		petfood: 'opff',
		product: 'opf'
	};

	let logoSuffix = $derived(FLAVOR_MAP[flavor]);
</script>

<picture class="mx-2 block h-10 w-44 sm:h-12 sm:w-68 lg:mx-6">
	<source
		srcset={`https://static.openfoodfacts.org/images/logos/${logoSuffix}-logo-horizontal-dark.svg`}
		media="(prefers-color-scheme: dark)"
	/>
	<img
		src={`https://static.openfoodfacts.org/images/logos/${logoSuffix}-logo-horizontal-light.svg`}
		alt="OpenFoodFacts Explorer"
		class="h-full w-full"
	/>
</picture>
