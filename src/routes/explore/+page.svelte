<script lang="ts">
	import Logo from '$lib/ui/Logo.svelte';
	import SearchBar from '$lib/ui/SearchBar.svelte';
	import { _ } from '$lib/i18n';
	import type { PageProps } from './$types';
	import WcProductCard from '$lib/ui/WcProductCard.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data }: PageProps = $props();
	let searchQuery = $state('');
	let typingPlaceholder = $state(' ');

	const placeholders = [
		'Search for a product...',
		'Try "Nutella"',
		'Search by brand...',
		'Try "organic pasta"',
		'Search by barcode...'
	];

	onMount(() => {
		let phraseIndex = 0;
		let charIndex = 0;
		let isDeleting = false;
		let timeout: ReturnType<typeof setTimeout>;

		function tick() {
			const current = placeholders[phraseIndex];

			if (!isDeleting) {
				typingPlaceholder = current.slice(0, charIndex + 1);
				charIndex++;

				if (charIndex === current.length) {
					isDeleting = true;
					timeout = setTimeout(tick, 1500);
					return;
				}
				timeout = setTimeout(tick, 80);
			} else {
				typingPlaceholder = current.slice(0, charIndex - 1);
				charIndex--;

				if (charIndex === 0) {
					isDeleting = false;
					phraseIndex = (phraseIndex + 1) % placeholders.length;
					timeout = setTimeout(tick, 400);
					return;
				}
				timeout = setTimeout(tick, 40);
			}
		}

		tick();
		return () => clearTimeout(timeout);
	});

	function handleSearch(query: string) {
		goto(`/search?q=${encodeURIComponent(query)}`);
	}
</script>

<section class="bg-base-100 flex flex-col items-center justify-center px-4 py-16">
	<Logo />
	<h1 class="text-primary mb-3 text-center text-4xl font-bold drop-shadow-lg sm:text-5xl">
		{$_('explore.title')}
	</h1>
	<p class="text-base-content/60 mb-8 max-w-2xl text-center text-lg">
		{$_('explore.subtitle')}
	</p>
	<div data-hero-search class="flex w-full max-w-2xl justify-center">
		<SearchBar bind:searchQuery onSearch={handleSearch} placeholder={typingPlaceholder} />
	</div>
</section>

<div class="mx-auto w-full max-w-7xl px-4 pb-16">
	{#if data.sections}
		{#each data.sections as section (section.category)}
			<section class="mb-12">
				<h2 class="text-primary mb-4 text-2xl font-bold">Most popular {section.category}</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each section.products as product (product.code)}
						<div>
							<div class="indicator indicator-center indicator-bottom w-full">
								<p class="indicator-item badge badge-info text-xs select-none">
									{product.scans_n} scans
								</p>
								<WcProductCard {product} />
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	{:else}
		<div class="flex h-32 items-center justify-center">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{/if}
</div>

<style>
	[data-hero-search] :global(.input) {
		border-color: var(--color-secondary);
		box-shadow: 0 0 12px color-mix(in oklch, var(--color-secondary) 25%, transparent);
	}

	[data-hero-search] :global(.input:focus) {
		box-shadow: 0 0 20px color-mix(in oklch, var(--color-secondary) 40%, transparent);
	}
</style>
