<script lang="ts">
	import footerTopLeft from '$lib/assets/footer-top-left.svg';
	import footerBottomRight from '$lib/assets/footer-bottom-right.svg';
	import { _ } from '$lib/i18n';
	import { page } from '$app/state';
	import Logo from './Logo.svelte';
	import { shouldBeContainer } from '$lib/layout';

	import IconSimpleIconsX from '@iconify-svelte/simple-icons/x';
	import IconMdiInstagram from '@iconify-svelte/mdi/instagram';
	import IconMdiGithub from '@iconify-svelte/mdi/github';
	import IconMdiFacebook from '@iconify-svelte/mdi/facebook';
	import IconMdiSlack from '@iconify-svelte/mdi/slack';

	const stayUpdatedLinks = [
		{ url: 'https://link.openfoodfacts.org/newsletter-en', key: 'footer.links.newsletter' },
		{ url: 'https://forum.openfoodfacts.org/', key: 'footer.links.forum' }
	];

	const contributeLinks = [
		{ url: 'https://world.pro.openfoodfacts.org/', key: 'footer.links.producers' },
		{
			url: 'https://world.openfoodfacts.org/cgi/top_translators.pl',
			key: 'footer.links.translators'
		},
		{ url: 'https://github.com/openfoodfacts', key: 'footer.links.github' },
		{ url: '/static/data', key: 'footer.links.data_api_sdks' },
		{ url: 'https://wiki.openfoodfacts.org/', key: 'footer.links.wiki' }
	];

	const discoverProjectLinks = [
		{
			url: '/static/who-we-are',
			key: 'footer.discover.who_we_are'
		},
		{
			url: 'https://blog.openfoodfacts.org/en/',
			key: 'footer.discover.blog'
		},
		{
			url: '/static/code-of-conduct',
			key: 'footer.discover.code_of_conduct'
		},
		{
			url: '/static/open-food-facts-vision-mission-values-and-programs',
			key: 'footer.discover.vision_mission_values_and_programs'
		},
		{
			url: '/static/partners',
			key: 'footer.discover.partners'
		},
		{
			url: 'https://support.openfoodfacts.org/help/en-gb',
			key: 'footer.discover.faq'
		},
		{
			url: '/static/presskit',
			key: 'footer.discover.press'
		}
	];

	const footerLinks = [
		{ url: '/static/legal', key: 'footer.links.legal' },
		{ url: '/static/privacy', key: 'footer.links.privacy' },
		{ url: '/static/terms-of-use', key: 'footer.links.terms_of_use' }
	];
</script>

<div
	class="bg-secondary text-secondary-content relative mt-2 flex flex-col justify-between gap-0 overflow-hidden px-10 py-8 md:flex-row md:px-20 lg:px-36"
	class:mt-10={shouldBeContainer(page.url.pathname)}
>
	<div class="relative z-20 order-1 flex w-full flex-col gap-2 md:w-1/2">
		<h2 class="text-3xl font-extrabold">{$_('footer.stay_updated')}</h2>
		<div class="flex flex-col gap-0">
			{#each stayUpdatedLinks as stayUpdatedLink (stayUpdatedLink.url)}
				<a href={stayUpdatedLink.url} class="underline">{$_(stayUpdatedLink.key)}</a>
			{/each}
			<div class="mt-1 flex gap-3">
				<a
					href="https://twitter.com/OpenFoodFacts"
					target="_blank"
					aria-label={$_('footer.social.x')}
				>
					<IconSimpleIconsX class="h-6 w-5" />
				</a>
				<a
					href="https://www.instagram.com/open.food.facts/"
					target="_blank"
					aria-label={$_('footer.social.instagram')}
				>
					<IconMdiInstagram class="h-6 w-6" />
				</a>
				<a
					href="https://github.com/openfoodfacts/openfoodfacts-explorer"
					target="_blank"
					aria-label={$_('footer.social.github')}
				>
					<IconMdiGithub class="h-6 w-6" />
				</a>
				<a
					href="https://www.facebook.com/OpenFoodFacts"
					target="_blank"
					aria-label={$_('footer.social.facebook')}
				>
					<IconMdiFacebook class="h-6 w-6" />
				</a>
				<a
					href="https://slack.openfoodfacts.org/"
					target="_blank"
					aria-label={$_('footer.social.slack')}
				>
					<IconMdiSlack class="h-6 w-6" />
				</a>
			</div>
		</div>

		<h2 class="mt-3 text-3xl font-extrabold">{$_('footer.contribute')}</h2>
		<div class="flex flex-wrap gap-3">
			{#each contributeLinks as contributeLink (contributeLink.url)}
				<a href={contributeLink.url} class="underline">{$_(contributeLink.key)}</a>
			{/each}
		</div>
	</div>
	<div class="relative z-20 order-2 mt-8 flex w-full flex-col gap-2 md:mt-0 md:w-1/2">
		<h2 class="text-3xl font-extrabold">{$_('footer.discover_title')}</h2>
		<div class="mt-2 flex flex-wrap gap-2">
			{#each discoverProjectLinks as link (link.url)}
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
		<img
			src={footerTopLeft}
			style="width: 177px; height: 177px;"
			alt={$_('footer.decorative_alt')}
		/>
	</div>
	<div class="absolute right-0 bottom-0 z-0 hidden md:block">
		<img
			src={footerBottomRight}
			style="width: 251px; height: 178px;"
			alt={$_('footer.decorative_alt')}
		/>
	</div>
	<div class="relative z-10 flex flex-col items-center gap-4">
		<Logo mono />

		<div class="text-primary text-center md:bg-transparent md:text-inherit">
			{$_('footer.tagline')}<br />{$_('footer.tagline_break')}
		</div>
	</div>

	<div class="text-primary relative z-10 mt-5 flex w-full flex-wrap justify-center gap-3 text-sm">
		{#each footerLinks as footerLink (footerLink.url)}
			<a href={footerLink.url} class="underline">{$_(footerLink.key)}</a>
		{/each}
	</div>
</div>
