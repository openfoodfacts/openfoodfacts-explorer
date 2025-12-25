<script lang="ts">
	import { _ } from '$lib/i18n';

	import Logo from '$lib/ui/Logo.svelte';

	import { createRobotoffApi, ProductsApi } from '$lib/api';
	import { onMount } from 'svelte';
	import { deduplicate } from '$lib/utils';
	import { personalizedSearch } from '$lib/stores/preferencesStore';
	import type { ProductAttributeForScoringGroup } from '$lib/api/product';
	import ProductGrid from '$lib/ui/ProductGrid.svelte';

	import type { PageProps } from './$types';
	let { data }: PageProps = $props();

	type ReducedState = Awaited<ReturnType<typeof getProducts>>[number];
	let products: Promise<ReducedState[]> = $state(Promise.resolve([]));

	let attributesByCode: Promise<Record<string, ProductAttributeForScoringGroup[]>> = $state(
		Promise.resolve({})
	);

	import chocoBarIcon from '$lib/assets/chocolate-bar.svg';
	import cheeseIcon from '$lib/assets/cheese.svg';
	import butterIcon from '$lib/assets/butter.svg';
	import eggIcon from '$lib/assets/egg-01.svg';
	import pastaIcon from '$lib/assets/pasta.svg';
	import { resolve } from '$app/paths';

	const heroIcons = [chocoBarIcon, cheeseIcon, butterIcon, eggIcon, pastaIcon];

	// random icons
	heroIcons.sort(() => Math.random() - 0.5);

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
		const productStates = await Promise.all(productsPromises);

		// filter out products that failed to load
		const products = productStates
			.map((res) => res.data)
			.filter((res) => res != null)
			.filter((state) => state?.status !== 'failure');

		// remove duplicate products
		return deduplicate(products, (it) => it.product.code);
	}

	async function getAttributes(products: ReducedState[]) {
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

	<title>{$_('landing.title')}</title>
</svelte:head>

<section
	class="relative flex min-h-[480px] flex-col items-center justify-center overflow-hidden px-4 pt-16 pb-12"
>
	<!-- Decorative SVG assets -->
	<img src={heroIcons[0]} alt="hero icon" class="decorative-svg -top-10 -left-10 w-40" />
	<img src={heroIcons[1]} alt="hero icon" class="decorative-svg -right-10 -bottom-10 w-40" />

	<div
		class="dark:bg-base-300/90 border-base-200/40 flex w-full max-w-2xl flex-col items-center rounded-3xl border bg-white/90 p-8 shadow-xl backdrop-blur-md"
	>
		<div class="mb-4 h-14 w-full scale-110 px-16 drop-shadow-lg md:h-20">
			<Logo class="h-full w-full" />
		</div>

		<p class="text-base-content/80 mb-6 max-w-xl text-center text-lg font-medium md:text-xl">
			{$_('landing.subtitle')}
		</p>
		<div class="flex w-full flex-wrap justify-center gap-4">
			<a
				href="/explore"
				class="btn btn-primary btn-lg flex items-center gap-2 px-6 shadow-md transition-transform hover:scale-105"
			>
				<span class="icon-[mdi--compass-outline] h-5 w-5"></span>
				{$_('landing.explore_products')}
			</a>
			<a
				href="/static/discover"
				class="btn btn-secondary btn-lg flex items-center gap-2 px-6 shadow-md transition-transform hover:scale-105"
			>
				<span class="icon-[mdi--lightbulb-on-outline] h-5 w-5"></span>
				{$_('landing.discover_project')}
			</a>
			<a
				href="/static/contribute"
				class="btn btn-outline btn-lg flex items-center gap-2 px-6 shadow-md transition-transform hover:scale-105"
			>
				<span class="icon-[mdi--account-heart-outline] h-5 w-5"></span>
				{$_('landing.contribute')}
			</a>
		</div>
	</div>
</section>

<div class="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
	<a
		href={resolve('/explore')}
		class="border-secondary hover:bg-base-200 focus:bg-base-200 focus:ring-primary flex flex-col items-center rounded-lg border p-6 text-center transition outline-none focus:ring-2"
	>
		<span class="icon-[mdi--database] text-primary mb-4 h-12 w-12"></span>
		<h2 class="text-xl font-bold">{Intl.NumberFormat().format(data.productCount)}</h2>
		<p class="text-base-content/70">{$_('landing.products_count')}</p>
	</a>
	<a
		href={resolve('/facets/[facet]', { facet: 'editors' })}
		class="border-secondary hover:bg-base-200 focus:bg-base-200 focus:ring-primary flex flex-col items-center rounded-lg border p-6 text-center transition outline-none focus:ring-2"
	>
		<span class="icon-[mdi--account-group] text-primary mb-4 h-12 w-12"></span>
		<h2 class="text-xl font-bold">{Intl.NumberFormat().format(data.editorCount)}</h2>
		<p class="text-base-content/70">{$_('landing.editors_count')}</p>
	</a>
	<a
		href={resolve('/static/[id]', { id: 'data' })}
		class="border-secondary hover:bg-base-200 focus:bg-base-200 focus:ring-primary flex flex-col items-center rounded-lg border p-6 text-center transition outline-none focus:ring-2"
	>
		<span class="icon-[mdi--license] text-primary mb-4 h-12 w-12"></span>
		<h2 class="text-xl font-bold">100%</h2>
		<p class="text-base-content/70">{$_('landing.open_data')}</p>
	</a>
</div>

<div class="xl:max-w-8xl container mx-auto mt-16 px-4">
	<donation-banner></donation-banner>
</div>
<div class="xl:max-w-8xl container mx-auto mt-16 px-4">
	<mobile-badges></mobile-badges>
</div>

<div class="xl:max-w-8xl container mx-auto mt-16 px-4"></div>

<div class="xl:max-w-8xl container mx-auto mt-16 px-4"></div>

<section class="container mx-auto mt-16 w-full max-w-7xl px-4">
	<div class="mb-6 text-center">
		<h2 class="text-primary mb-2 text-2xl font-bold">
			{$_('landing.help_improve_title')}
		</h2>
		<p class="text-base-content/70 mx-auto max-w-2xl text-base">
			{$_('landing.help_improve_desc')}
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

<style>
	@keyframes gentleFloat {
		0% {
			transform: translateY(0) scale(1);
		}
		50% {
			transform: translateY(-8px) scale(1.05);
		}
		100% {
			transform: translateY(0) scale(1);
		}
	}

	.decorative-svg {
		pointer-events: none;
		position: absolute;
		z-index: -10;
		opacity: 0.7;
		filter: brightness(1.15) grayscale(0.15);
		animation: gentleFloat 7s ease-in-out infinite;

		@media (prefers-color-scheme: dark) {
			opacity: 0.2;
		}
	}
</style>
