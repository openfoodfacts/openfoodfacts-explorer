<script lang="ts">
	import footerTopLeft from '$lib/assets/footer-top-left.svg';
	import footerBottomRight from '$lib/assets/footer-bottom-right.svg';
	import { _ } from '$lib/i18n';
	import { page } from '$app/state';
	import { NO_MARGIN_ROUTES } from '$lib/const';

	const stayUpdatedLinks = [
		{ url: 'https://link.openfoodfacts.org/newsletter-en', text: 'Newsletter' },
		{ url: 'https://forum.openfoodfacts.org/', text: 'Forum' }
	];

	const contributeLinks = [
		{ url: 'https://world.pro.openfoodfacts.org/', text: 'Producers' },
		{ url: 'https://world.openfoodfacts.org/cgi/top_translators.pl', text: 'Translators' },
		{ url: 'https://github.com/openfoodfacts', text: 'GitHub' },
		{ url: 'https://world.openfoodfacts.org/data', text: 'Data, API, SDKs' },
		{ url: 'https://wiki.openfoodfacts.org/', text: 'Wiki' }
	];

	const discoverProjectLinks = {
		row1: [
			{
				url: 'https://world.openfoodfacts.org/who-we-are',
				key: 'footer.discover.who_we_are'
			},
			{
				url: 'https://blog.openfoodfacts.org/en/',
				key: 'footer.discover.blog'
			},
			{
				url: 'https://world.openfoodfacts.org/code-of-conduct',
				key: 'footer.discover.code_of_conduct'
			}
		],
		row2: [
			{
				url: 'https://world.openfoodfacts.org/open-food-facts-vision-mission-values-and-programs',
				key: 'footer.discover.vision_mission_values_and_programs'
			}
		],
		row3: [
			{
				url: 'https://world.openfoodfacts.org/partners',
				key: 'footer.discover.partners'
			},
			{
				url: 'https://support.openfoodfacts.org/help/en-gb',
				key: 'footer.discover.faq'
			},
			{
				url: 'https://world.openfoodfacts.org/press',
				key: 'footer.discover.press'
			}
		]
	};

	const footerLinks = [
		{ url: 'https://world.openfoodfacts.org/legal', text: 'Legal' },
		{ url: 'https://world.openfoodfacts.org/privacy', text: 'Privacy' },
		{ url: 'https://world.openfoodfacts.org/terms-of-use', text: 'Terms of use' }
	];
</script>

<div
	class="bg-secondary text-secondary-content relative mt-2 flex flex-col justify-between gap-0 overflow-hidden px-10 py-8 md:flex-row md:px-20 lg:px-36"
	class:mt-10={!NO_MARGIN_ROUTES.includes(page.url.pathname)}
>
	<div class="relative z-20 order-1 flex w-full flex-col gap-2 md:w-1/2">
		<h2 class="text-3xl font-extrabold">Stay Updated</h2>
		<div class="flex flex-col gap-0">
			{#each stayUpdatedLinks as stayUpdatedLink (stayUpdatedLink.url)}
				<a href={stayUpdatedLink.url} class="underline">{stayUpdatedLink.text}</a>
			{/each}
			<div class="mt-1 flex gap-3">
				<a
					href="https://twitter.com/OpenFoodFacts"
					target="_blank"
					aria-label="X (formerly Twitter)"
				>
					<span class="icon-[simple-icons--x] h-6 w-5"></span>
				</a>
				<a href="https://www.instagram.com/open.food.facts/" target="_blank" aria-label="Instagram">
					<span class="icon-[mdi--instagram] h-6 w-6"></span>
				</a>
				<a
					href="https://github.com/openfoodfacts/openfoodfacts-explorer"
					target="_blank"
					aria-label="GitHub"
				>
					<span class="icon-[mdi--github] h-6 w-6"></span>
				</a>
				<a href="https://www.facebook.com/OpenFoodFacts" target="_blank" aria-label="Facebook">
					<span class="icon-[mdi--facebook] h-6 w-6"></span>
				</a>
				<a href="https://slack.openfoodfacts.org/" target="_blank" aria-label="Slack">
					<span class="icon-[mdi--slack] h-6 w-6"></span>
				</a>
			</div>
		</div>

		<h2 class="mt-3 text-3xl font-extrabold">Contribute</h2>
		<div class="flex flex-wrap gap-3">
			{#each contributeLinks as contributeLink (contributeLink.url)}
				<a href={contributeLink.url} class="underline">{contributeLink.text}</a>
			{/each}
		</div>
	</div>
	<div class="relative z-20 order-2 mt-8 flex w-full flex-col gap-2 md:mt-0 md:w-1/2">
		<h2 class="text-3xl font-extrabold">Discover our Project</h2>
		<div class="mt-2 flex flex-wrap gap-2">
			{#each discoverProjectLinks.row1 as link (link.url)}
				<a
					href={link.url}
					class="bg-secondary-content text-primary rounded-full px-4 py-2 transition-opacity hover:opacity-80"
				>
					{$_(link.key)}
				</a>
			{/each}
		</div>
		<div class="mt-1 flex flex-wrap gap-2">
			{#each discoverProjectLinks.row2 as link (link.url)}
				<a
					href={link.url}
					class="bg-secondary-content text-primary rounded-full px-4 py-2 transition-opacity hover:opacity-80"
				>
					{$_(link.key)}
				</a>
			{/each}
		</div>
		<div class="mt-1 flex flex-wrap gap-2">
			{#each discoverProjectLinks.row3 as link (link.url)}
				<a
					href={link.url}
					class="bg-secondary-content text-primary rounded-full px-4 py-2 transition-opacity hover:opacity-80"
				>
					{$_(link.key)}
				</a>
			{/each}
		</div>
	</div>
</div>

<div
	class="bg-primary-content relative flex flex-col items-center justify-center gap-3 overflow-hidden px-10 py-8"
>
	<div class="absolute top-0 left-0 z-0 hidden md:block">
		<img src={footerTopLeft} alt="" width="177" height="177" />
	</div>
	<div class="absolute right-0 bottom-0 z-0 hidden md:block">
		<img src={footerBottomRight} alt="" width="251" height="178" />
	</div>
	<div class="relative z-10 flex flex-col items-center gap-4">
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

		<div class="text-primary text-center md:bg-transparent md:text-inherit">
			A collaborative, free and open database of food products<span class="hidden md:inline"
				><br /></span
			><span class="md:hidden"> </span> from around the world.
		</div>
	</div>

	<div class="text-primary relative z-10 mt-5 flex w-full flex-wrap justify-center gap-3 text-sm">
		{#each footerLinks as footerLink (footerLink.url)}
			<a href={footerLink.url} class="underline">{footerLink.text}</a>
		{/each}
	</div>
</div>
