<script lang="ts">
	import { _ } from '$lib/i18n';
	import { goto } from '$app/navigation';

	import Card from '$lib/ui/Card.svelte';
	import Logo from '$lib/ui/Logo.svelte';
	import { userInfo } from '$lib/stores/pkceLoginStore';
	import PreferencesForm from '$lib/ui/PreferencesForm.svelte';

	import { ProductsApi, type ProductReduced, type ProductStateFound } from '$lib/api';
	import { onMount } from 'svelte';
	import { Robotoff } from '@openfoodfacts/openfoodfacts-nodejs';
	import { deduplicate } from '$lib/utils';
	import { classifyProductsEnabled, userPreferences } from '$lib/stores/preferencesStore';
	import { scoreAndSortProducts, type ScoredProduct } from '$lib/productScoring';

	let sortedProducts: (ProductStateFound<ProductReduced> & ScoredProduct)[] = $state([]);
	
	let resolvedProducts: ProductStateFound<ProductReduced>[] = $state([]);
	
	let scoredProducts: (ProductStateFound<ProductReduced> & ScoredProduct)[] = $state([]);
	
	let attributesByCode: Record<string, unknown[]> = $state({});

	// Track which product is being navigated to
	let navigatingTo: string | null = $state(null);

	// Track preferences form visibility
	let showPreferences = $state(false);

	// Handle navigation to product page
	function navigateToProduct(barcode: string) {
		navigatingTo = barcode;
		goto(`/products/${barcode}`);
	}

	let products: Promise<ProductStateFound<ProductReduced>[]> = $state(Promise.resolve([]));

	const INSIGHT_COUNT = 10;
	const SKELETON_COUNT = 9;

	async function getProducts() {
		const roffApi = new Robotoff(fetch);
		const response = await roffApi.insights({ count: INSIGHT_COUNT });

		const productApi = new ProductsApi(fetch);

		const insights = response?.insights ?? [];

		const productsPromises = insights.map((question) =>
			productApi.getProductReducedForCard(question.barcode.toString())
		);
		const states = await Promise.all(productsPromises);
		// filter out products that failed to load
		const products = states.filter(
			(state): state is ProductStateFound<ProductReduced> => state.status !== 'failure'
		);

		// remove duplicate products
		let dedupProducts = deduplicate(products, (it) => it.product.code);

		// get attributes for all products using the API
		const productCodes = dedupProducts.map(state => state.product.code);
		const attrs = await productApi.getBulkProductAttributes(productCodes);
		attributesByCode = attrs;

		return dedupProducts;
	}

	// Effect to add scores to products and sort them based on classify toggle
	$effect(() => {
		if (resolvedProducts.length > 0 && Object.keys(attributesByCode).length > 0) {
			const productsWithAttributes = resolvedProducts.map((state) => ({
				...state,
				attributes: attributesByCode[state.product.code] || []
			}));

			const result = scoreAndSortProducts(productsWithAttributes, $userPreferences, $classifyProductsEnabled);
			
			scoredProducts = result.scoredProducts;
			sortedProducts = result.sortedProducts;
		}
	});

	onMount(() => {
		products = getProducts();
		products.then((prods) => {
			resolvedProducts = prods;
		});
	});
</script>

<svelte:head>
	<!-- Preconnect to static assets -->
	<link rel="preconnect" href="https://images.openfoodfacts.org" crossorigin="anonymous" />

	<title>Open Food Facts Explorer</title>
</svelte:head>

<div class="mx-auto my-4 flex flex-col items-center md:container xl:max-w-6xl">
	<Card>
		<div class="card-body items-center px-0 text-center">
			<h3 class="card-title mb-4 block text-2xl md:flex">
				{#if $userInfo != null}
					{$_('home.welcome_user', { values: { username: $userInfo.preferred_username } })}
				{:else}
					{$_('home.welcome')}
				{/if}
				<div class="block xl:inline-block">
					<Logo />
				</div>
				Explorer!
			</h3>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<p>{@html $_('home.intro_1')}</p>
			<p>{$_('home.intro_2')}</p>
		</div>
	</Card>

	<!-- Preferences Toggle Button -->
	{#if !showPreferences}
		<div class="mt-6 flex w-full justify-end">
			<button
				class="btn btn-primary flex items-center justify-center gap-2"
				onclick={() => (showPreferences = !showPreferences)}
			>
				<span class="icon-[mdi--cog] text-lg"></span>
				{$_('preferences.edit_preferences')}
			</button>
		</div>
	{/if}

	<!-- Preferences Form -->
	{#if showPreferences}
		<div class="mt-4 w-full">
			<!-- Top Close Button -->
			<div class="mb-4 flex justify-end">
				<button
					class="btn btn-primary flex items-center gap-2"
					onclick={() => (showPreferences = false)}
					aria-label={$_('preferences.close')}
				>
					<span class="icon-[mdi--close] text-lg"></span>
					{$_('preferences.close')}
				</button>
			</div>

			<PreferencesForm onClose={() => (showPreferences = false)} />
		</div>
	{/if}

	<div class="mt-8 flex w-full">
		<div
			class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-2 xl:grid-cols-3"
		>
			{#await products}
				{#each Array(SKELETON_COUNT) as _, index (index)}
					<div class="skeleton h-36 w-full rounded-lg"></div>
				{/each}
			{:then _}
				{#each sortedProducts as state (state.product.code)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<product-card
						product={state.product}
						navigating={{
							to:
								navigatingTo === state.product.code
									? { params: { barcode: state.product.code } }
									: null
						}}
						placeholderImage="/Placeholder.svg"
						onclick={() => navigateToProduct(state.product.code)}
					></product-card>
				{/each}
			{/await}
		</div>
	</div>

	<div class="xl:max-w-8xl container mx-auto mt-16 px-4">
		<donation-banner></donation-banner>
	</div>
	<div class="xl:max-w-8xl container mx-auto mt-16 px-4">
		<mobile-badges></mobile-badges>
	</div>
</div>
