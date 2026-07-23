<script lang="ts">
	import footerTopLeft from '$lib/assets/footer-top-left.svg';
	import footerBottomRight from '$lib/assets/footer-bottom-right.svg';
	import { _ } from '$lib/i18n';
	import { page } from '$app/state';
	import Logo from './Logo.svelte';
	import { shouldBeContainer } from '$lib/layout';

	import IconSimpleIconsX from '@iconify-svelte/simple-icons/x';
	import IconSimpleIconsMastodon from '@iconify-svelte/simple-icons/mastodon';
	import IconSimpleIconsBluesky from '@iconify-svelte/simple-icons/bluesky';
	import IconMdiInstagram from '@iconify-svelte/mdi/instagram';
	import IconMdiGithub from '@iconify-svelte/mdi/github';
	import IconMdiFacebook from '@iconify-svelte/mdi/facebook';
	import IconMdiSlack from '@iconify-svelte/mdi/slack';

	const LINKS_STAY_UPDATED = [
		{ url: 'https://link.openfoodfacts.org/newsletter-en', key: 'footer.links.newsletter' },
		{ url: 'https://forum.openfoodfacts.org/', key: 'footer.links.forum' }
	];

	const LINKS_SOCIAL = [
		{
			url: 'https://twitter.com/OpenFoodFacts',
			key: 'footer.social.x',
			icon: IconSimpleIconsX,
			iconClass: 'h-6 w-5'
		},
		{
			url: 'https://mastodon.social/@openfoodfacts',
			key: 'footer.social.mastodon',
			icon: IconSimpleIconsMastodon
		},
		{
			url: 'https://bsky.app/profile/openfoodfacts.bsky.social',
			key: 'footer.social.bluesky',
			icon: IconSimpleIconsBluesky
		},
		{
			url: 'https://www.instagram.com/open.food.facts/',
			key: 'footer.social.instagram',
			icon: IconMdiInstagram
		},
		{
			url: 'https://github.com/openfoodfacts/openfoodfacts-explorer',
			key: 'footer.social.github',
			icon: IconMdiGithub
		},
		{
			url: 'https://www.facebook.com/OpenFoodFacts',
			key: 'footer.social.facebook',
			icon: IconMdiFacebook
		},
		{ url: 'https://slack.openfoodfacts.org/', key: 'footer.social.slack', icon: IconMdiSlack }
	];

	const LINKS_CONTRIBUTE = [
		{ url: 'https://world.pro.openfoodfacts.org/', key: 'footer.links.producers' },
		{
			url: 'https://world.openfoodfacts.org/cgi/top_translators.pl',
			key: 'footer.links.translators'
		},
		{ url: 'https://github.com/openfoodfacts', key: 'footer.links.github' },
		{ url: '/static/data', key: 'footer.links.data_api_sdks' },
		{ url: 'https://wiki.openfoodfacts.org/', key: 'footer.links.wiki' }
	];

	const LINKS_DISCOVER_PROJECTS = [
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

	const LINKS_FOOTER = [
		{ url: '/static/legal', key: 'footer.links.legal' },
		{ url: '/static/privacy', key: 'footer.links.privacy' },
		{ url: '/static/terms-of-use', key: 'footer.links.terms_of_use' }
	];
</script>

<div
	class="relative mt-2 flex flex-col justify-between gap-0 overflow-hidden bg-secondary px-10 py-8 text-secondary-content md:flex-row md:px-20 lg:px-36"
	class:mt-10={shouldBeContainer(page.url.pathname)}
>
	<div class="relative z-20 order-1 flex w-full flex-col gap-2 md:w-1/2">
		<h2 class="text-3xl font-extrabold">{$_('footer.stay_updated')}</h2>
		<div class="flex flex-col gap-0">
			{#each LINKS_STAY_UPDATED as stayUpdatedLink (stayUpdatedLink.url)}
				<a href={stayUpdatedLink.url} class="link link-hover">{$_(stayUpdatedLink.key)}</a>
			{/each}
			<div class="mt-1 flex gap-3">
				{#each LINKS_SOCIAL as social (social.url)}
					<a
						href={social.url}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={$_(social.key)}
					>
						<svelte:component this={social.icon} class={social.iconClass ?? 'h-6 w-6'} />
					</a>
				{/each}
			</div>
		</div>

		<h2 class="mt-3 text-3xl font-extrabold">{$_('footer.contribute')}</h2>
		<div class="flex flex-wrap gap-3">
			{#each LINKS_CONTRIBUTE as contributeLink (contributeLink.url)}
				<a href={contributeLink.url} class="link link-hover">{$_(contributeLink.key)}</a>
			{/each}
		</div>
	</div>
	<div class="relative z-20 order-2 mt-8 flex w-full flex-col gap-2 md:mt-0 md:w-1/2">
		<h2 class="text-3xl font-extrabold">{$_('footer.discover_title')}</h2>
		<div class="mt-2 flex flex-wrap gap-2">
			{#each LINKS_DISCOVER_PROJECTS as link (link.url)}
				<a
					href={link.url}
					class="rounded-full bg-secondary-content px-4 py-2 text-primary transition-opacity hover:opacity-80"
				>
					{$_(link.key)}
				</a>
			{/each}
		</div>
	</div>
</div>

<div
	class="relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-primary-content px-10 py-8"
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

		<div class="text-center text-primary md:bg-transparent md:text-inherit">
			{$_('footer.tagline')}<br />{$_('footer.tagline_break')}
		</div>
	</div>

	<div class="relative z-10 mt-5 flex w-full flex-wrap justify-center gap-3 text-sm text-primary">
		{#each LINKS_FOOTER as footerLink (footerLink.url)}
			<a href={footerLink.url} class="link link-hover">{$_(footerLink.key)}</a>
		{/each}
	</div>
</div>
