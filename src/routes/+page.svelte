<script lang="ts">
	import { _ } from '$lib/i18n';

	import Card from '$lib/ui/Card.svelte';
	import Logo from '$lib/ui/Logo.svelte';
	import { userInfo } from '$lib/stores/pkceLoginStore';

	import { createRobotoffApi, ProductsApi } from '$lib/api';
	import { onMount } from 'svelte';
	import { deduplicate } from '$lib/utils';
	import { personalizedSearch } from '$lib/stores/preferencesStore';
	import type { ProductAttributeForScoringGroup } from '$lib/api/product';
	import ProductGrid from '$lib/ui/ProductGrid.svelte';

	import { persisted } from 'svelte-local-storage-store';

	type ReducedState = Awaited<ReturnType<typeof getProducts>>[number];

	const alreadyVisited = persisted('alreadyVisited', false);
	function markAsVisited() {
		alreadyVisited.set(true);
	}

	let products: Promise<ReducedState[]> = $state(Promise.resolve([]));
	let attributesByCode: Promise<Record<string, ProductAttributeForScoringGroup[]>> = $state(
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

	<title>Open Food Facts Explorer</title>
</svelte:head>

{#if $alreadyVisited}
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
	</div>
{:else}
	<section class="bg-base-100 flex min-h-[80vh] flex-col items-center justify-center px-4 py-8">
		<div class="mb-8 flex flex-col items-center">
			<Logo />

			<h1 class="text-primary mb-2 text-center text-3xl font-bold sm:text-4xl">
				{$_('landing.title')}
			</h1>
			<p class="text-secondary-content mb-4 max-w-2xl text-center text-lg">
				{$_('landing.subtitle')}
			</p>
			<div class="mt-4 flex flex-wrap justify-center gap-4">
				<button onclick={markAsVisited} class="btn btn-primary btn-lg">
					{$_('landing.search_products')}
				</button>
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
					<a href="/products/search" class="link link-primary">{$_('landing.discover_link')}</a>
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
{/if}

<div class="xl:max-w-8xl container mx-auto mt-16 px-4">
	<donation-banner></donation-banner>
</div>
<div class="xl:max-w-8xl container mx-auto mt-16 px-4">
	<mobile-badges></mobile-badges>
</div>
