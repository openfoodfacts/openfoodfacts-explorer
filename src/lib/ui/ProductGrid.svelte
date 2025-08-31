<script lang="ts">
	import type { ProductAttributeGroup } from '$lib/api';
	import { personalizeSearchResults } from '$lib/productScoring';
	import { personalizedSearch } from '$lib/stores/preferencesStore';
	import type { ProductReduced } from '@openfoodfacts/openfoodfacts-nodejs';
	import WcProductCard from './WcProductCard.svelte';
	import type { ScoreData } from '$lib/scoring';

	type Props = {
		products: ProductReduced[];
		attributes?: Record<string, ProductAttributeGroup[]>;
		sortByScore?: boolean;
	};
	let { products, attributes, sortByScore }: Props = $props();

	let sortedProducts = $derived.by(() => {
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
