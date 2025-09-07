<script lang="ts">
	import { _ } from '$lib/i18n';

	import Card from '$lib/ui/Card.svelte';
	import Logo from '$lib/ui/Logo.svelte';
	import { userInfo } from '$lib/stores/pkceLoginStore';

	import {
		createRobotoffApi,
		ProductsApi,
		type ProductReduced,
		type ProductStateFound
	} from '$lib/api';
	import { onMount } from 'svelte';
	import { deduplicate } from '$lib/utils';
	import { personalizedSearch } from '$lib/stores/preferencesStore';
	import type { ProductAttributeGroup } from '$lib/api/product';
	import ProductGrid from '$lib/ui/ProductGrid.svelte';

	let products: Promise<ProductStateFound<ProductReduced>[]> = $state(Promise.resolve([]));
	let attributesByCode: Promise<Record<string, ProductAttributeGroup[]>> = $state(
		Promise.resolve({})
	);

	const INSIGHT_COUNT = 10;
	const SKELETON_COUNT = 9;

	async function getProducts() {
		const roffApi = createRobotoffApi(fetch);
		const { data: robotoffData } = await roffApi.insights({ count: INSIGHT_COUNT });

		const productApi = new ProductsApi(fetch);

		const insights = robotoffData?.insights ?? [];

		const productsPromises = insights.map((question) =>
			productApi.getProductReducedForCard(question.barcode.toString())
		);
		const states = await Promise.all(productsPromises);
		// filter out products that failed to load
		const products = states
			.filter((res) => res.data)
			.map((res) => res.data)
			.filter((state) => state?.status !== 'failure') as ProductStateFound<ProductReduced>[];

		// remove duplicate products
		return deduplicate(products, (it) => it.product.code);
	}

	async function getAttributes(products: ProductStateFound<ProductReduced>[]) {
		const productApi = new ProductsApi(fetch);
		const productCodes = products.map((state) => state.product.code);
		const attrs = await productApi.getBulkProductAttributes(productCodes);
		return attrs;
	}

	onMount(() => {
		products = getProducts();
		products.then((prod) => {
			attributesByCode = getAttributes(prod);
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

	<!-- Preferences Collapsible Section -->
	<div class="mt-6 w-full">
		<div class="form-control">
			<label class="label cursor-pointer justify-start gap-3">
				<input
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={$personalizedSearch.classifyProductsEnabled}
				/>
				<span class="label-text text-sm text-wrap">{$_('preferences.classify_products')}</span>
			</label>
		</div>
	</div>

	<div class="mt-8 flex w-full">
		{#await Promise.all([products, attributesByCode])}
			<div
				class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-2 xl:grid-cols-3"
			>
				{#each Array(SKELETON_COUNT) as _, index (index)}
					<div class="skeleton h-36 w-full rounded-lg"></div>
				{/each}
			</div>
		{:then [resolvedProducts, attributes]}
			<ProductGrid
				products={resolvedProducts.map((state) => state.product)}
				{attributes}
				sortByScore={$personalizedSearch.classifyProductsEnabled}
			/>
		{/await}
	</div>

	<div class="xl:max-w-8xl container mx-auto mt-16 px-4">
		<donation-banner></donation-banner>
	</div>
	<div class="xl:max-w-8xl container mx-auto mt-16 px-4">
		<mobile-badges></mobile-badges>
	</div>
</div>
