<script lang="ts">
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

	import type { ProductAttributeGroup, ProductReduced } from '$lib/api';
	import type { ScoreData } from '$lib/scoring';
	import { personalizeSearchResults, type ScoredProduct } from '$lib/productScoring';
	import { personalizedSearch } from '$lib/stores/preferencesStore';

	import WcProductCard from './WcProductCard.svelte';

	type AcceptableProduct = (Product & { code: string }) | ProductReduced;

	type Props = {
		// TODO: replace Product & ... with Product when code becomes non-optional in the API
		products: AcceptableProduct[];
		attributes?: Record<string, ProductAttributeGroup[]>;
		sortByScore?: boolean;
	};
	let { products, attributes, sortByScore }: Props = $props();

	let sortedProducts: Array<ScoredProduct<AcceptableProduct>> = $derived.by(() => {
		if (!sortByScore || !attributes) {
			return products.map((state) => ({
				product: state,
				score: 0,
				matchStatus: 'unknown_match',
				scoreData: {
					score: 0,
					matchStatus: 'unknown_match',
					totalWeights: 0,
					totalWeightedScore: 0
				} as ScoreData
			}));
		}

		const productsWithAttributes = products.map((product) => ({
			...product,
			attributes: attributes[product.code] ?? []
		}));

		return personalizeSearchResults(
			productsWithAttributes,
			$personalizedSearch.userPreferences,
			sortByScore
		);
	});
</script>

<div class="mt-8 flex w-full">
	<div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-2 xl:grid-cols-3">
		{#each sortedProducts as scoredProduct (scoredProduct.product.code)}
			<WcProductCard
				product={scoredProduct.product}
				personalScore={sortByScore ? scoredProduct.scoreData : undefined}
			/>
		{/each}
	</div>
</div>
