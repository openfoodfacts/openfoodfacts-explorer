<script>
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
</script>

<nav class="bg-secondary mt-2 px-4 {!shouldBeContainer(page.url.pathname) ? '' : 'mb-8'}">
	<ul class="flex justify-center">
		<div class="m-2 flex w-3/4 items-center justify-evenly 2xl:w-[60%]">
			{#each navItems as item (item.name)}
				<li>
					<a href={item.href} class="text-secondary-content font-medium hover:underline">
						{$_(item.name)}
					</a>
				</li>
			{/each}
		</div>
	</ul>
</nav>
