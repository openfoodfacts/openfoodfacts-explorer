<script>
	const navItems = [
		{ name: 'Discover', href: '#' },
		{ name: 'Contribute', href: '#' },
		{ name: 'Producers', href: '#' },
		{ name: 'Prices', href: '#' },
		{ name: 'Folksonomy', href: '/folksonomy' }
	];
</script>

<nav class="bg-secondary mt-2 mb-8 px-4">
	<ul class="flex justify-center">
		<div class="m-2 flex w-[70%] items-center justify-evenly 2xl:w-[60%]">
			{#each navItems as item (item.name)}
				<li>
					<a href={item.href} class="text-secondary-content font-medium hover:underline"
						>{item.name}</a
					>
				</li>
			{/each}
		</div>
	</ul>
</nav>
