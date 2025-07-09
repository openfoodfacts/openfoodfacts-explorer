<script>
	import { _ } from '$lib/i18n';
	import { page } from '$app/state';
	import { NO_MARGIN_ROUTES } from '$lib/const';

	const navItems = [
		{ name: 'discover_link', href: '/discover' },
		{ name: 'contribute_link', href: '/contribute' },
		{ name: 'producers_link', href: '/producers' },
		{ name: 'prices_link', href: '#' },
		{ name: 'folksonomy_link', href: '/folksonomy' }
	];
</script>

<nav class="bg-secondary mt-2 px-4 {NO_MARGIN_ROUTES.includes(page.url.pathname) ? '' : 'mb-8'}">
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
