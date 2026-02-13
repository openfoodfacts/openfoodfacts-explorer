<script lang="ts">
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

	import type { ProductAttributeForScoringGroup, ProductReduced } from '$lib/api';
	import type { ScoreData } from '$lib/scoring';
	import { personalizeSearchResults, type ProductWithAttributes } from '$lib/productScoring';
	import { personalizedSearch } from '$lib/stores/preferencesStore';

	import WcProductCard from './WcProductCard.svelte';

	type AnyProduct = Product | ProductReduced;

	type ProductWithScore = {
		product: AnyProduct;
		scoreData: ScoreData;
	};

	type Props = {
		products: AnyProduct[];
		attributes?: Record<string, ProductAttributeForScoringGroup[]>;
		sortByScore?: boolean;
	};
	let { products, attributes, sortByScore }: Props = $props();

	const UNKNOWN_SCORE_DATA: ScoreData = {
		score: 0,
		matchStatus: 'unknown_match',
		totalWeights: 0,
		totalWeightedScore: 0
	};

	let sortedProducts: ProductWithScore[] = $derived.by(() => {
		if (!sortByScore || !attributes) {
			return products.map((p) => ({ product: p, scoreData: UNKNOWN_SCORE_DATA }));
		}

		const productsWithAttributes: ProductWithAttributes<AnyProduct>[] = products.map((product) => ({
			product,
			attributes: attributes[product.code] ?? []
		}));

		const personalizedSearchResults = personalizeSearchResults(
			productsWithAttributes,
			$personalizedSearch.userPreferences,
			sortByScore
		);

		return personalizedSearchResults.map(({ product, scoreData }) => ({
			product: product.product,
			scoreData
		}));
	});
</script>

<div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-2 xl:grid-cols-3">
	{#each sortedProducts as { product, scoreData } (product.code)}
		<WcProductCard {product} personalScore={sortByScore ? scoreData : undefined} />
	{/each}
</div>
