<script lang="ts">
	import { _ } from '$lib/i18n';
	import { page } from '$app/state';
	import { shouldBeContainer } from '$lib/layout';

	const navItems = [
		{ name: 'discover_link', href: '/static/discover' },
		{ name: 'contribute_link', href: '/static/contribute' },
		{ name: 'producers_link', href: '/static/producers' },
		{ name: 'prices_link', href: 'https://prices.openfoodfacts.org' },
		{ name: 'folksonomy_link', href: '/folksonomy' },
		{ name: 'facets_link', href: '/facets' }
	];

	const isPricesExternalUrl = (href: string) => href.startsWith('https://prices.openfoodfacts.org');
</script>

<nav class="bg-secondary mt-2 px-4 {!shouldBeContainer(page.url.pathname) ? '' : 'mb-8'}">
	<ul class="flex justify-center">
		<div class="m-2 flex w-3/4 items-center justify-evenly 2xl:w-[60%]">
			{#each navItems as item (item.name)}
				{@const isPricesLink = isPricesExternalUrl(item.href)}
				{@const itemLabel = $_(item.name)}
				<li>
					<!-- Open external Prices links in a new tab to preserve app context. -->
					<a
						href={item.href}
						target={isPricesLink ? '_blank' : undefined}
						rel={isPricesLink ? 'noopener noreferrer' : undefined}
						aria-label={isPricesLink ? $_('product.prices.view_prices_new_tab') : undefined}
						class="text-secondary-content font-medium hover:underline"
					>
						{itemLabel}
					</a>
				</li>
			{/each}
		</div>
	</ul>
</nav>
