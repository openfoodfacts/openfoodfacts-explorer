<script lang="ts">
	import { run } from 'svelte/legacy';

	import Logo from '$lib/ui/Logo.svelte';
	import '../app.css';
	import 'leaflet/dist/leaflet.css';
	import { t } from '$lib/translations';

	let searchQuery: string = $state('');

	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	const GITHUB_REPO_URL = 'https://github.com/openfoodfacts/openfoodfacts-explorer';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		// only inject the script on the client side
		injectSpeedInsights();
	});

	function updateSearchQuery(url: URL) {
		searchQuery = url.searchParams.get('q') ?? '';
	}
	// update searchQuery when the ?q parameter changes
	run(() => {
		updateSearchQuery($page.url);
	});

	function gotoProductsSearch() {
		goto('/products/search?q=' + searchQuery);
	}

	let searchActive = $state(false);
	let accordionOpen = $state(false);
</script>

<svelte:head>
	<title>OFF Explorer</title>
	<meta name="description" content="Open Food Facts Explorer" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="navbar hidden md:flex">
	<div class="navbar-start">
		<a href="/"> <Logo /> </a>
	</div>
	<div class="navbar-center">
		<div class="form-control">
			<div>
				<div class="join">
					<input
						type="text"
						bind:value={searchQuery}
						class="input join-item input-bordered xl:w-full"
						placeholder="Query or barcode"
						onkeydown={(e) => {
							if (e.key === 'Enter' && searchQuery.trim() !== '') {
								gotoProductsSearch();
							}
						}}
					/>
					<button
						class="btn btn-square btn-secondary join-item px-10"
						onclick={() => gotoProductsSearch()}
						disabled={searchQuery == null || searchQuery.trim() === ''}
					>
						Go
					</button>
				</div>

				<a
					class="btn btn-secondary ms-4 px-5 text-lg"
					href="/qr"
					title="Scan a barcode"
					aria-label="Scan a barcode"
				>
					<span class="icon-[mdi--camera]"></span>
				</a>
			</div>
		</div>
	</div>

	<div class="navbar-end gap-2">
		<a class="btn btn-outline link" href="/folksonomy">{$t('common.folksonomy')}</a>
		<a class="btn btn-outline link" href="/settings">{$t('common.settings')}</a>
		<a
			class="btn btn-outline link"
			href={GITHUB_REPO_URL}
			target="_blank"
			aria-label={$t('common.github')}
		>
			<span class="icon-[mdi--github] h-8 w-8"></span>
		</a>
	</div>
</div>

<div class="mx-4 md:hidden">
	<div class="navbar bg-base-100 mx-auto mt-2 mb-8 max-w-7xl">
		<div class="navbar-start">
			<a href="/">
				<Logo />
			</a>
		</div>
		<div class="navbar-end flex gap-2">
			<button
				aria-label="Search"
				class="btn btn-square btn-secondary text-lg"
				onclick={() => {
					searchActive = !searchActive;
				}}
			>
				<i class="icon-[mdi--magnify]"></i>
			</button>
			<a
				class="btn btn-square btn-secondary text-lg"
				href="/qr"
				title="Scan a barcode"
				aria-label="Scan a barcode"
			>
				<span class="icon-[mdi--camera]"></span>
			</a>
			<button
				class="btn btn-square btn-secondary text-lg"
				onclick={() => {
					accordionOpen = !accordionOpen;
				}}
			>
				{#if accordionOpen}
					<i class="icon-[mdi--close]"></i>
				{:else}
					<i class="icon-[mdi--menu]"></i>
				{/if}
			</button>
		</div>
	</div>
	{#if searchActive}
		<div class="join -mt-8 w-full">
			<input
				type="text"
				bind:value={searchQuery}
				class="input join-item input-bordered w-full"
				placeholder="Query or barcode"
				onkeydown={(e) => {
					if (e.key === 'Enter' && searchQuery.trim() !== '') {
						gotoProductsSearch();
					}
				}}
			/>
			<button
				class="btn btn-square btn-secondary join-item"
				onclick={() => gotoProductsSearch()}
				disabled={searchQuery == null || searchQuery.trim() === ''}
			>
				Go
			</button>
		</div>
	{/if}
	<div class:hidden={!accordionOpen} class="mt-3 flex flex-wrap justify-center gap-2">
		<a class="btn btn-outline link" href="/folksonomy">
			{$t('common.folksonomy')}
		</a>
		<a class="btn btn-outline link" href="/settings">
			{$t('common.settings')}
		</a>
		<a
			class="btn btn-outline link"
			href={GITHUB_REPO_URL}
			target="_blank"
			aria-label={$t('common.github')}
		>
			<span class="icon-[mdi--github] h-6 w-6"></span>
		</a>
	</div>
</div>

<div class="container mx-auto my-2 flex flex-col gap-4 px-4 xl:max-w-6xl">
	{@render children?.()}
</div>

<div class="flex flex-col gap-5 md:flex-row justify-between bg-secondary px-10 md:px-2 py-8 lg:px-40 text-black mt-10">
	<div class="flex flex-col gap-1">
		<div class="text-lg font-bold">Join the community</div>
		<div>
			Discover our <a href="https://world.openfoodfacts.org/code-of-conduct" class="underline">Code of conduct</a>
		</div>
		<div>Join us on <a href="https://slack.openfoodfacts.org/" class="underline">Slack</a></div>
		<div><a href="https://forum.openfoodfacts.org/" class="underline">Forum</a></div>
		<div class="flex gap-2">
			<div>Follow us:</div>
			<a
				href="https://twitter.com/OpenFoodFacts"
				target="_blank"
				aria-label="Open Food Facts Twitter"
			>
				<span class="icon-[mdi--twitter] h-6 w-6"></span>
			</a>
			<a
				href="https://www.facebook.com/OpenFoodFacts?utm_source=off&utf_medium=web"
				target="_blank"
				aria-label="Open Food Facts Facebook"
			>
				<span class="icon-[mdi--facebook] h-6 w-6"></span>
			</a>
			<a
				href="https://www.instagram.com/open.food.facts/"
				target="_blank"
				aria-label="Open Food Facts Instagram"
			>
				<span class="icon-[mdi--instagram] h-6 w-6"></span>
			</a>
			<a
				href={GITHUB_REPO_URL}
				target="_blank"
				aria-label="Open Food Facts GitHub repository"
			>
				<span class="icon-[mdi--github] h-6 w-6"></span>
			</a>
		</div>
		<div>
			<a href="https://link.openfoodfacts.org/newsletter-en" class="underline"
				>Subscribe to our newsletter</a
			>
		</div>
	</div>
	<div class="flex flex-col gap-2 md:max-w-1/2">
		<div class="text-lg font-bold">Discover the project</div>
		<div class="text-sm flex gap-3 flex-wrap">
			<a href="https://world.openfoodfacts.org/who-we-are" class="bg-white text-black px-2 py-1 rounded-lg hover:bg-base-300 hover:text-white transition-all duration-300">Who we are</a>
			<a href="https://world.openfoodfacts.org/open-food-facts-vision-mission-values-and-programs" class="bg-white text-black px-2 py-1 rounded-lg hover:bg-base-300 hover:text-white transition-all duration-300">Vision, Mission, Values and Programs</a>
			<a href="https://support.openfoodfacts.org/help/en-gb" class="bg-white text-black px-2 py-1 rounded-lg hover:bg-base-300 hover:text-white transition-all duration-300">Frequently asked questions</a>
			<a href="https://blog.openfoodfacts.org/en/" class="bg-white text-black px-2 py-1 rounded-lg hover:bg-base-300 hover:text-white transition-all duration-300">Open Food Facts blog</a>
			<a href="https://world.openfoodfacts.org/press" class="bg-white text-black px-2 py-1 rounded-lg hover:bg-base-300 hover:text-white transition-all duration-300">Press</a>
			<a href="https://wiki.openfoodfacts.org/" class="bg-white text-black px-2 py-1 rounded-lg hover:bg-base-300 hover:text-white transition-all duration-300">Open Food Facts wiki (en)</a>
			<a href="https://world.openfoodfacts.org/cgi/top_translators.pl" class="bg-white text-black px-2 py-1 rounded-lg hover:bg-base-300 hover:text-white transition-all duration-300">Translators</a>
			<a href="https://world.openfoodfacts.org/partners" class="bg-white text-black px-2 py-1 rounded-lg hover:bg-base-300 hover:text-white transition-all duration-300">Partners</a>
			<a href="https://world.openbeautyfacts.org/" class="bg-white text-black px-2 py-1 rounded-lg hover:bg-base-300 hover:text-white transition-all duration-300">Open Food Facts - Cosmetics</a>
			<a href="https://world.pro.openfoodfacts.org/" class="bg-white text-black px-2 py-1 rounded-lg hover:bg-base-300 hover:text-white transition-all duration-300">Open Food Facts for Producers</a>

		</div>
	</div>
</div>
<div class="bg-base-200 py-5 text-white flex flex-col gap-3 justify-center items-center p-4 manrope">
	<div>
		<a href="/"><img src="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-mono-white.svg" alt="Open Food Facts"></a>
	</div>
	<div class="text-sm">
		A collaborative, free and open database of food products from around the world.
	</div>
	<div class="textarea-xs">
		<div class="flex gap-3 flex-wrap">
			<a href="https://world.openfoodfacts.org/legal" class="underline">Legal</a>
			<a href="https://world.openfoodfacts.org/privacy" class="underline">Privacy</a>
			<a href="https://world.openfoodfacts.org/terms-of-use" class="underline">Terms of use</a>
			<a href="https://world.openfoodfacts.org/data" class="underline">Data, API and SDKs</a>
			<a href="https://world.openfoodfacts.org/legal" class="underline">Donate to Open Food Facts</a>
			<a href="https://world.openfoodfacts.org/legal" class="underline">Producers</a>
			<a href="https://world.openfoodfacts.org/legal" class="underline">Subscribe to our newsletter</a>
		</div>
	</div>
</div>
