<script lang="ts">
	const projectLinks = [
		{ url: 'https://world.openfoodfacts.org/who-we-are', text: 'Who we are' },
		{
			url: 'https://world.openfoodfacts.org/open-food-facts-vision-mission-values-and-programs',
			text: 'Vision, Mission, Values and Programs'
		},
		{ url: 'https://support.openfoodfacts.org/help/en-gb', text: 'Frequently asked questions' },
		{ url: 'https://blog.openfoodfacts.org/en/', text: 'Open Food Facts blog' },
		{ url: 'https://world.openfoodfacts.org/press', text: 'Press' },
		{ url: 'https://wiki.openfoodfacts.org/', text: 'Open Food Facts wiki (en)' },
		{ url: 'https://world.openfoodfacts.org/cgi/top_translators.pl', text: 'Translators' },
		{ url: 'https://world.openfoodfacts.org/partners', text: 'Partners' },
		{ url: 'https://world.openbeautyfacts.org/', text: 'Open Food Facts - Cosmetics' },
		{ url: 'https://world.pro.openfoodfacts.org/', text: 'Open Food Facts for Producers' }
	];

	const footerLinks = [
		{ url: 'https://world.openfoodfacts.org/legal', text: 'Legal' },
		{ url: 'https://world.openfoodfacts.org/privacy', text: 'Privacy' },
		{ url: 'https://world.openfoodfacts.org/terms-of-use', text: 'Terms of use' },
		{ url: 'https://world.openfoodfacts.org/data', text: 'Data, API and SDKs' },
		{
			url: 'https://world.openfoodfacts.org/donate-to-open-food-facts',
			text: 'Donate to Open Food Facts'
		},
		{ url: 'https://world.pro.openfoodfacts.org/', text: 'Producers' },
		{ url: 'https://link.openfoodfacts.org/newsletter-en', text: 'Subscribe to our newsletter' }
	];
</script>

<div
	class="bg-secondary text-secondary-content mt-10 flex flex-col justify-between gap-5 px-10 py-8 md:flex-row md:px-20 lg:px-40"
>
	<div class="flex flex-col gap-1">
		<div class="text-lg font-bold">Join the community</div>
		<div>
			Discover our <a href="https://world.openfoodfacts.org/code-of-conduct" class="underline"
				>Code of conduct</a
			>
		</div>
		<div>Join us on <a href="https://slack.openfoodfacts.org/" class="underline">Slack</a></div>
		<div><a href="https://forum.openfoodfacts.org/" class="underline">Forum</a></div>
		<div class="flex gap-2">
			<div>Follow us:</div>
			<a
				href="https://twitter.com/OpenFoodFacts"
				target="_blank"
				aria-label="Open Food Facts X (formerly Twitter)"
			>
				<svg
					width="24px"
					height="24px"
					viewBox="0 0 24 24"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
						fill="currentColor"
					/>
				</svg>
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
				href="https://github.com/openfoodfacts/openfoodfacts-explorer"
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
		<div class="flex flex-wrap gap-3 text-sm">
			{#each projectLinks as link (link.url)}
				<a
					href={link.url}
					class="bg-base-300 text-base-content hover:bg-primary hover:text-primary-content rounded-lg px-2 py-1 transition-all duration-300"
				>
					{link.text}
				</a>
			{/each}
		</div>
	</div>
</div>

<div class="bg-base-200 flex flex-col items-center justify-center gap-3 px-6 py-5">
	<picture>
		<source
			srcset="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-mono-white.svg"
			media="(prefers-color-scheme: dark)"
		/>
		<img
			src="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-mono-black.svg"
			alt="Open Food Facts"
		/>
	</picture>

	<div class="text-sm">
		A collaborative, free and open database of food products from around the world.
	</div>
	<div class="flex w-full flex-wrap justify-center gap-3 text-xs">
		{#each footerLinks as footerLink (footerLink.url)}
			<a href={footerLink.url} class="underline">{footerLink.text}</a>
		{/each}
	</div>
</div>
