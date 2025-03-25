<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { preferences } from '$lib/settings';

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

	const colorScheme = writable('white');
	const userLanguage = writable('en');
	const userCountry = writable('US');
	const apple_badgePath = writable('');
	const playstore_badgePath = writable('');
	let apple_defaultPath = `/footer/app_store_badges/${colorScheme}/appstore_US.svg`;
	let playstore_defaultPath = `/footer/play_store_badges/en_get.svg`;

	onMount(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const updateScheme = () => colorScheme.set(mediaQuery.matches ? 'white' : 'black');

		updateScheme();
		mediaQuery.addEventListener('change', updateScheme);

		return () => mediaQuery.removeEventListener('change', updateScheme);
	});

	$effect(() => {
		userLanguage.set($preferences.lang || 'en');
		userCountry.set($preferences.country || 'US');
	});

	async function checkImageExists(url: string) {
		try {
			const response = await fetch(url, { method: 'HEAD' });
			return response.ok;
		} catch {
			return false;
		}
	}

	$effect(() => {
		(async () => {
			const lang = $userLanguage;
			const playstorePath = `/footer/play_store_badges/${lang}_get.svg`;
			const exists = await checkImageExists(playstorePath);
			playstore_badgePath.set(exists ? playstorePath : `/footer/play_store_badges/en_get.svg`);
		})();
		$effect(() => {
			(async () => {
				const scheme = $colorScheme;
				const country = $userCountry;
				const applePath = `/footer/app_store_badges/${scheme}/appstore_${country.toUpperCase()}.svg`;
				const exists = await checkImageExists(applePath);
				apple_badgePath.set(
					exists ? applePath : `/footer/app_store_badges/${scheme}/appstore_US.svg`
				);
			})();
		});
	});
</script>

<div class="mt-10 flex flex-wrap items-center justify-evenly gap-3 px-2 py-5 md:px-6">
	<div>
		<img src="/footer/off_footer.svg" alt="Open Food Facts" class="h-28" />
	</div>
	<div class="flex flex-col gap-1 text-center text-xl font-semibold">
		<div class="text-2xl font-semibold tracking-tight uppercase">Install the App!</div>
		<div>
			Scan Your
			<span
				class="inline-block rotate-3 rounded-md bg-[#0064C8] px-1 font-semibold text-white uppercase"
				>Everyday</span
			>
		</div>
		<div class="flex justify-center">
			<span
				class="inline-block -rotate-2 rounded-md bg-[#FF8714] px-1 font-semibold text-white uppercase"
				>foods</span
			>
		</div>
	</div>
	<div class="flex flex-wrap items-center justify-center gap-2 md:justify-end">
		{#if playstore_badgePath}
			<a
				href="https://play.google.com/store/apps/details?id=org.openfoodfacts.scanner&utm_source=off&utm_medium=web&utm_campaign=install_the_app_android_footer_en"
				target="_blank"
				rel="noopener noreferrer"
				class="-mx-3"
			>
				<img
					src={$playstore_badgePath}
					alt="Google Play Store badge"
					class="h-16 w-auto"
					onerror={() => playstore_badgePath.set(playstore_defaultPath)}
				/>
			</a>
		{/if}
		<a
			href="https://f-droid.org/packages/openfoodfacts.github.scrachx.openfood"
			target="_blank"
			class="-mx-2"
		>
			<img src="/footer/f-droid.png" alt="" class="h-16" />
		</a>
		<a href="https://github.com/openfoodfacts/smooth-app/releases/tag/v4.19.0" target="_blank">
			<img src="/footer/apk_android.svg" alt="" class="h-[42px]" />
		</a>
		{#if apple_badgePath}
			<a
				href="https://apps.apple.com/app/open-food-facts/id588797948?utm_source=off&utf_medium=web&utm_campaign=install_the_app_ios_footer_en"
				target="_blank"
				rel="noopener noreferrer"
			>
				<img
					src={$apple_badgePath}
					alt="App Store Badge"
					class="h-[42px] w-auto"
					onerror={() => apple_badgePath.set(apple_defaultPath)}
				/>
			</a>
		{/if}
	</div>
</div>

<div
	class="bg-secondary text-secondary-content flex flex-col justify-between gap-5 px-10 py-8 md:flex-row md:px-20 lg:px-40"
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
				<span class="icon-[logos--x] h-6 w-5"></span>
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
