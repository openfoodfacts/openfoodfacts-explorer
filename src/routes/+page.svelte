<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { _ } from '$lib/i18n';
	import { createRobotoffApi, getProductReducedForCard, getBulkProductAttributes } from '$lib/api';
	import { deduplicate } from '$lib/utils';
	import { personalizedSearch } from '$lib/stores/preferencesStore';
	import type { ProductAttributeForScoringGroup } from '$lib/api/product';

	import Logo from '$lib/ui/Logo.svelte';
	import ProductGrid from '$lib/ui/ProductGrid.svelte';
	import PersonalizedSearchToggle from '../lib/ui/PersonalizedSearchToggle.svelte';

	import IconMdiCompassOutline from '@iconify-svelte/mdi/compass-outline';
	import IconMdiLightbulbOnOutline from '@iconify-svelte/mdi/lightbulb-on-outline';
	import IconMdiAccountHeartOutline from '@iconify-svelte/mdi/account-heart-outline';
	import IconMdiDatabase from '@iconify-svelte/mdi/database';
	import IconMdiAccountGroup from '@iconify-svelte/mdi/account-group';
	import IconMdiLicense from '@iconify-svelte/mdi/license';

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

	const heroIcons = [chocoBarIcon, cheeseIcon, butterIcon, eggIcon, pastaIcon];

	// random icons
	heroIcons.sort(() => Math.random() - 0.5);

	const INSIGHT_COUNT = 12;
	const SKELETON_COUNT = 6;

	async function getProducts() {
		const roffApi = createRobotoffApi(fetch);
		const { data: robotoffData } = await roffApi.insights({ count: INSIGHT_COUNT });

		const insights = robotoffData?.insights ?? [];

		const productsPromises = insights.map((question) =>
			getProductReducedForCard(fetch, question.barcode.toString())
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
		const productCodes = products.map((state) => state.product.code);
		const attrs = await getBulkProductAttributes(fetch, productCodes);
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
	<img src={heroIcons[0]} alt="" aria-hidden="true" class="decorative-svg -top-10 -left-10 w-40" />
	<img
		src={heroIcons[1]}
		alt=""
		aria-hidden="true"
		class="decorative-svg -right-10 -bottom-10 w-40"
	/>

	<div
		class="dark:bg-base-300/90 border-base-200/40 flex w-full max-w-2xl flex-col items-center rounded-3xl border bg-white/90 p-6 shadow-xl backdrop-blur-md lg:p-8"
	>
		<div class="mb-4 h-14 w-full scale-100 px-4 drop-shadow-lg md:h-20 lg:scale-110 lg:px-16">
			<Logo class="h-full w-full" />
		</div>

		<p class="text-base-content/80 mb-6 max-w-xl text-center text-lg font-medium md:text-xl">
			{$_('landing.subtitle')}
		</p>
		<div class="flex w-full flex-wrap justify-center gap-4">
			<a
				href={resolve('/explore')}
				class="btn btn-primary btn-md lg:btn-lg flex w-full items-center gap-2 px-4 shadow-md transition-transform hover:scale-105 sm:w-auto lg:px-6"
			>
				<IconMdiCompassOutline class="h-5 w-5" />
				{$_('landing.explore_products')}
			</a>
			<a
				href={resolve('/static/[id]', { id: 'discover' })}
				class="btn btn-secondary btn-md lg:btn-lg flex w-full items-center gap-2 px-4 shadow-md transition-transform hover:scale-105 sm:w-auto lg:px-6"
			>
				<IconMdiLightbulbOnOutline class="h-5 w-5" />
				{$_('landing.discover_project')}
			</a>
			<a
				href={resolve('/static/[id]', { id: 'contribute' })}
				class="btn btn-outline btn-md lg:btn-lg flex w-full items-center gap-2 px-4 shadow-md transition-transform hover:scale-105 sm:w-auto lg:px-6"
			>
				<IconMdiAccountHeartOutline class="h-5 w-5" />
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
		<IconMdiDatabase class="text-primary mb-4 h-12 w-12" />
		<h2 class="text-xl font-bold">{Intl.NumberFormat().format(data.productCount)}</h2>
		<p class="text-base-content/70">{$_('landing.products_count')}</p>
	</a>
	<a
		href={resolve('/facets/[facet]', { facet: 'contributors' })}
		class="border-secondary hover:bg-base-200 focus:bg-base-200 focus:ring-primary flex flex-col items-center rounded-lg border p-6 text-center transition outline-none focus:ring-2"
	>
		<IconMdiAccountGroup class="text-primary mb-4 h-12 w-12" />
		<h2 class="text-xl font-bold">{Intl.NumberFormat().format(data.contributorCount)}</h2>
		<p class="text-base-content/70">{$_('landing.contributors_count')}</p>
	</a>
	<a
		href={resolve('/static/[id]', { id: 'data' })}
		class="border-secondary hover:bg-base-200 focus:bg-base-200 focus:ring-primary flex flex-col items-center rounded-lg border p-6 text-center transition outline-none focus:ring-2"
	>
		<IconMdiLicense class="text-primary mb-4 h-12 w-12" />
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
	<div class="mx-auto mb-4 w-full max-w-2xl">
		<PersonalizedSearchToggle></PersonalizedSearchToggle>
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
