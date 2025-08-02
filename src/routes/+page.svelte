<script lang="ts">
	import { _ } from '$lib/i18n';
	import { goto } from '$app/navigation';

	import Card from '$lib/ui/Card.svelte';
	import Logo from '$lib/ui/Logo.svelte';
	import { userInfo } from '$lib/stores/pkceLoginStore';
	import { ProductsApi, type ProductReduced, type ProductStateFound } from '$lib/api';
	import { onMount } from 'svelte';
	import { Robotoff } from '@openfoodfacts/openfoodfacts-nodejs';
	import { deduplicate } from '$lib/utils';

	// Track which product is being navigated to
	let navigatingTo: string | null = $state(null);

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
		return deduplicate(products, (it) => it.product.code);
	}

	onMount(() => {
		products = getProducts();
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

	<div class="mt-8 flex w-full">
		<div
			class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-2 xl:grid-cols-3"
		>
			{#await products}
				{#each Array(SKELETON_COUNT) as _, index (index)}
					<div class="skeleton h-36 w-full rounded-lg"></div>
				{/each}
			{:then products}
				{#each products as state (state.product.code)}
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
