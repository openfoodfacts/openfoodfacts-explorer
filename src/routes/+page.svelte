<script lang="ts">
	import { _ } from '$lib/i18n';

	import Card from '$lib/ui/Card.svelte';
	import Logo from '$lib/ui/Logo.svelte';

	import {
		createRobotoffApi,
		ProductsApi,
		type ProductReduced,
		type ProductStateFound
	} from '$lib/api';
	import { onMount } from 'svelte';
	import { deduplicate } from '$lib/utils';
	import { personalizedSearch } from '$lib/stores/preferencesStore';
	import type { ProductAttributeForScoringGroup } from '$lib/api/product';
	import ProductGrid from '$lib/ui/ProductGrid.svelte';

	let products: Promise<ProductStateFound<ProductReduced>[]> | ProductStateFound<ProductReduced>[] =
		$state([]);
	let attributesByCode: Promise<Record<string, ProductAttributeForScoringGroup[]>> = $state(
		Promise.resolve({})
	);

	const INSIGHT_COUNT = 12;
	const SKELETON_COUNT = 6;

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

<section class="bg-base-100 flex flex-col items-center justify-center px-4 pt-12 pb-8">
	<div class="mb-8 flex flex-col items-center">
		<Logo />
		<h1 class="text-primary mb-2 text-center text-4xl font-bold drop-shadow-lg sm:text-5xl">
			{$_('landing.title')}
		</h1>
		<p class="text-secondary-content mb-4 max-w-2xl text-center text-lg">
			{$_('landing.subtitle')}
		</p>
		<div class="mt-4 flex flex-wrap justify-center gap-4">
			<a href="/explore" class="btn btn-primary btn-lg">
				{$_('landing.explore_products')}
			</a>
			<a href="/static/discover" class="btn btn-secondary btn-lg">
				{$_('landing.discover_project')}
			</a>
			<a href="/static/contribute" class="btn btn-outline btn-lg">{$_('landing.contribute')}</a>
		</div>
	</div>

	<div class="mt-8 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
		<Card>
			<div class="flex flex-col items-center text-center">
				<span class="icon-[mdi--magnify] text-primary mb-2 text-4xl"></span>
				<h2 class="mb-1 text-xl font-semibold">{$_('landing.discover_title')}</h2>
				<p class="mb-2 text-base">{$_('landing.discover_desc')}</p>
				<a href="/search" class="link link-primary">{$_('landing.discover_link')}</a>
			</div>
		</Card>
		<Card>
			<div class="flex flex-col items-center text-center">
				<span class="icon-[mdi--account-group] text-primary mb-2 text-4xl"></span>
				<h2 class="mb-1 text-xl font-semibold">{$_('landing.contribute_title')}</h2>
				<p class="mb-2 text-base">{$_('landing.contribute_desc')}</p>
				<a href="/static/contribute" class="link link-primary">{$_('landing.contribute_link')}</a>
			</div>
		</Card>
		<Card>
			<div class="flex flex-col items-center text-center">
				<span class="icon-[mdi--cellphone] text-primary mb-2 text-4xl"></span>
				<h2 class="mb-1 text-xl font-semibold">{$_('landing.get_app_title')}</h2>
				<p class="mb-2 text-base">{$_('landing.get_app_desc')}</p>
				<div class="mt-2 flex justify-center gap-2">
					<a
						href="https://play.google.com/store/apps/details?id=org.openfoodfacts.scanner"
						target="_blank"
						rel="noopener"
						class="btn btn-sm btn-outline">{$_('landing.google_play')}</a
					>
					<a
						href="https://apps.apple.com/app/open-food-facts/id588797948"
						target="_blank"
						rel="noopener"
						class="btn btn-sm btn-outline">{$_('landing.app_store')}</a
					>
				</div>
			</div>
		</Card>
	</div>
</section>

<div class="xl:max-w-8xl container mx-auto mt-16 px-4">
	<donation-banner></donation-banner>
</div>

<section class="mx-auto mt-16 w-full max-w-7xl">
	<div class="mb-6 text-center">
		<h2 class="text-primary mb-2 text-2xl font-bold">Help Improve These Products</h2>
		<p class="text-base-content/70 mx-auto max-w-2xl text-base">
			These products have open questions or missing information. Your answers and edits help make
			Open Food Facts better for everyone!
		</p>
		<div class="bg-primary/30 mx-auto mt-4 mb-2 h-1 w-16 rounded"></div>
	</div>

	<!-- Preferences Collapsible Section -->
	<div class="mx-auto mt-10 w-full max-w-2xl">
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

	<div class="flex w-full">
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
</section>

<div class="xl:max-w-8xl container mx-auto mt-16 px-4">
	<mobile-badges></mobile-badges>
</div>
