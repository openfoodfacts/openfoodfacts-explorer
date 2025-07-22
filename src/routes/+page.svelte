<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';

	import Card from '$lib/ui/Card.svelte';
	import Logo from '$lib/ui/Logo.svelte';
	import { userInfo } from '$lib/stores/pkceLoginStore';

	let { data }: PageProps = $props();
	let { products } = $derived(data);

	// Track which product is being navigated to
	let navigatingTo: string | null = $state(null);

	// Handle navigation to product page
	function navigateToProduct(barcode: string) {
		navigatingTo = barcode;
		goto(`/products/${barcode}`);
	}
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
		</div>
	</div>
	<div class="xl:max-w-8xl container mx-auto mt-16 px-4">
		<donation-banner></donation-banner>
	</div>
	<div class="xl:max-w-8xl container mx-auto mt-16 px-4">
		<mobile-badges></mobile-badges>
	</div>
</div>
