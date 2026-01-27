<script lang="ts">
	import { _ } from '$lib/i18n';
	import footerLogo from '$lib/assets/footer/footer-logo.svg';

	import iconSlack from '$lib/assets/footer/icon-slack.svg';
	import iconGithub from '$lib/assets/footer/icon-github.svg';
	import iconInstagram from '$lib/assets/footer/icon-instagram.svg';
	import iconFacebook from '$lib/assets/footer/icon-facebook.svg';
	import iconX from '$lib/assets/footer/icon-x.svg';

	const socialLinks = [
		{ name: 'Slack', url: 'https://slack.openfoodfacts.org/', icon: iconSlack },
		{
			name: 'GitHub',
			url: 'https://github.com/openfoodfacts/openfoodfacts-explorer',
			icon: iconGithub
		},
		{ name: 'Instagram', url: 'https://www.instagram.com/open.food.facts/', icon: iconInstagram },
		{ name: 'Facebook', url: 'https://www.facebook.com/OpenFoodFacts', icon: iconFacebook },
		{ name: 'X', url: 'https://twitter.com/OpenFoodFacts', icon: iconX }
	];

	const columns = [
		{
			title: 'Stay Updated',
			links: [
				{ text: 'Newsletter', url: 'https://link.openfoodfacts.org/newsletter-en' },
				{ text: 'Forum', url: 'https://forum.openfoodfacts.org/' }
			]
		},
		{
			title: 'Contribute',
			links: [
				{ text: 'Translators', url: 'https://world.openfoodfacts.org/cgi/top_translators.pl' },
				{ text: 'Producers', url: 'https://world.pro.openfoodfacts.org/' },
				{ text: 'GitHub', url: 'https://github.com/openfoodfacts' },
				{ text: 'Data, API, SDKs', url: '/static/data' },
				{ text: 'Wiki', url: 'https://wiki.openfoodfacts.org/' }
			]
		},
		{
			title: 'Discover our Project',
			links: [
				{ text: 'Who we are', url: '/static/who-we-are' },
				{ text: 'Blog', url: 'https://blog.openfoodfacts.org/en/' },
				{ text: 'Code of Conduct', url: '/static/code-of-conduct' },
				{
					text: 'Vision, Mission, Values and Programs',
					url: '/static/open-food-facts-vision-mission-values-and-programs'
				},
				{ text: 'Partners', url: '/static/partners' },
				{ text: 'FAQ', url: 'https://support.openfoodfacts.org/help/en-gb' },
				{ text: 'Press', url: '/static/presskit' }
			]
		}
	];

	const legalLinks = [
		{ text: 'Legal', url: '/static/legal' },
		{ text: 'Privacy', url: '/static/privacy' },
		{ text: 'Terms of use', url: '/static/terms-of-use' }
	];
</script>

<footer
	class="mx-auto mt-10 w-[calc(100%-34px)] rounded-t-[50px] bg-[#EBC2A8] px-[58px] py-10 text-black min-[1105px]:px-[60px] min-[1105px]:py-16 md:w-[calc(100%-64px)] md:px-[50px] md:py-12 xl:px-[80px]"
>
	<div class="layout-phone flex-col items-center gap-8">
		<div class="flex flex-col items-center gap-4">
			<img src={footerLogo} alt="Open Food Facts" class="h-auto w-[200px]" />
			<div class="flex w-[200px] items-center justify-between">
				{#each socialLinks as social}
					<a
						href={social.url}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={social.name}
						class="transition-opacity hover:opacity-80"
					>
						<img src={social.icon} alt={social.name} class="h-6 w-6" />
					</a>
				{/each}
			</div>
		</div>

		<div class="flex w-[200px] flex-col gap-6">
			<div class="grid grid-cols-2 gap-x-4 gap-y-4">
				<div class="flex flex-col gap-2">
					<h3 class="text-xs font-normal text-black">{columns[1].title}</h3>
					<ul class="flex flex-col gap-2">
						{#each columns[1].links as link}
							<li>
								<a href={link.url} class="text-xs font-bold text-black hover:underline"
									>{link.text}</a
								>
							</li>
						{/each}
					</ul>
				</div>

				<div class="flex flex-col gap-2">
					<h3 class="text-xs font-normal text-black">{columns[0].title}</h3>
					<ul class="flex flex-col gap-2">
						{#each columns[0].links as link}
							<li>
								<a href={link.url} class="text-xs font-bold text-black hover:underline"
									>{link.text}</a
								>
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<div class="flex flex-col gap-2">
				<h3 class="text-xs font-normal text-black">{columns[2].title}</h3>
				<ul class="flex flex-col gap-2">
					{#each columns[2].links as link}
						<li>
							<a href={link.url} class="text-xs font-bold text-black hover:underline">{link.text}</a
							>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="flex w-[200px] flex-wrap justify-center gap-4 text-xs font-bold text-black">
			{#each legalLinks as link}
				<a href={link.url} class="underline decoration-1 underline-offset-2 hover:decoration-2"
					>{link.text}</a
				>
			{/each}
		</div>
	</div>

	<div class="layout-tablet flex-col gap-8">
		<div class="flex flex-col gap-4">
			<img src={footerLogo} alt="Open Food Facts" class="h-auto w-[200px]" />
			<div class="flex w-[200px] items-center justify-between">
				{#each socialLinks as social}
					<a
						href={social.url}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={social.name}
						class="transition-opacity hover:opacity-80"
					>
						<img src={social.icon} alt={social.name} class="h-7 w-7" />
					</a>
				{/each}
			</div>
		</div>

		<div class="flex flex-row justify-between gap-6">
			<div class="flex flex-col gap-4">
				<h3 class="text-base font-normal text-black">{columns[0].title}</h3>
				<ul class="flex flex-col gap-4">
					{#each columns[0].links as link}
						<li>
							<a href={link.url} class="text-base font-bold text-black hover:underline"
								>{link.text}</a
							>
						</li>
					{/each}
				</ul>

				<div class="mt-auto flex flex-row gap-6 text-base font-bold text-black">
					{#each legalLinks as link}
						<a href={link.url} class="underline decoration-1 underline-offset-2 hover:decoration-2"
							>{link.text}</a
						>
					{/each}
				</div>
			</div>

			<div class="flex flex-col gap-4">
				<h3 class="text-base font-normal text-black">{columns[1].title}</h3>
				<ul class="flex flex-col gap-4">
					{#each columns[1].links as link}
						<li>
							<a href={link.url} class="text-base font-bold text-black hover:underline"
								>{link.text}</a
							>
						</li>
					{/each}
				</ul>
			</div>

			<div class="flex flex-col gap-4">
				<h3 class="text-base font-normal text-black">{columns[2].title}</h3>
				<ul class="flex flex-col gap-4">
					{#each columns[2].links as link}
						<li>
							<a href={link.url} class="text-base font-bold text-black hover:underline"
								>{link.text}</a
							>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>

	<div class="layout-desktop flex-row justify-between gap-12 xl:gap-20">
		<div class="flex flex-shrink-0 flex-col justify-between">
			<div class="flex flex-col gap-6">
				<img src={footerLogo} alt="Open Food Facts" class="h-auto w-[200px] xl:w-[280px]" />
				<div class="flex w-[200px] items-center justify-between xl:w-[280px]">
					{#each socialLinks as social}
						<a
							href={social.url}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={social.name}
							class="transition-opacity hover:opacity-80"
						>
							<img src={social.icon} alt={social.name} class="h-8 w-8 xl:h-9 xl:w-9" />
						</a>
					{/each}
				</div>
			</div>
			<div
				class="mt-auto flex flex-row gap-5 pt-8 text-[16px] font-bold text-black xl:gap-6 xl:text-[18px]"
			>
				{#each legalLinks as link}
					<a href={link.url} class="underline decoration-1 underline-offset-2 hover:decoration-2"
						>{link.text}</a
					>
				{/each}
			</div>
		</div>

		<div class="flex flex-row gap-10 min-[1200px]:gap-16 xl:gap-24">
			{#each columns as column}
				<div class="flex flex-col gap-5 xl:gap-6">
					<h3 class="text-[16px] font-normal text-black xl:text-[18px]">{column.title}</h3>
					<ul class="flex flex-col gap-5 xl:gap-6">
						{#each column.links as link}
							<li>
								<a
									href={link.url}
									class="text-[16px] font-bold text-black hover:underline xl:text-[18px]"
									>{link.text}</a
								>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>
</footer>

<style>
	.layout-phone {
		display: flex;
	}
	.layout-tablet {
		display: none;
	}
	.layout-desktop {
		display: none;
	}

	@media (min-width: 500px) {
		.layout-phone {
			display: none;
		}
		.layout-tablet {
			display: flex;
		}
		.layout-desktop {
			display: none;
		}
	}

	@media (min-width: 1105px) {
		.layout-phone {
			display: none;
		}
		.layout-tablet {
			display: none;
		}
		.layout-desktop {
			display: flex;
		}
	}
</style>
