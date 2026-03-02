<script lang="ts">
	import { preferences } from '$lib/settings';
	import { _ } from '$lib/i18n';
	import { locale } from '$lib/i18n';
	import PreferencesForm from '$lib/ui/preferences/PreferencesForm.svelte';
	import type { AttributeGroup } from '$lib/stores/preferencesStore';
	import { userInfo } from '$lib/stores/user';

	import IconMdiShieldAccount from '@iconify-svelte/mdi/shield-account';
	import IconMdiAccount from '@iconify-svelte/mdi/account';
	import IconMaterialTranslate from '@iconify-svelte/material-symbols/translate';
	import IconMaterialPublic from '@iconify-svelte/material-symbols/public';
	import IconMaterialUniversalCurrencyAlt from '@iconify-svelte/material-symbols/universal-currency-alt';
	import IconMdiGithub from '@iconify-svelte/mdi/github';
	import IconMdiTools from '@iconify-svelte/mdi/tools';

	import type { PageProps } from './$types';

	const GITHUB_REPO_URL = 'https://github.com/openfoodfacts/openfoodfacts-explorer';

	let { data }: PageProps = $props();
	let { attributeGroups } = $derived(data);
</script>

<div class="mx-auto my-8">
	<p class="mb-4 font-semibold">{$_('settings.section_user')}</p>
	{#if $userInfo}
		<p class="mb-4 text-center text-xl font-medium">
			{$_('settings.logged_in_as', { values: { username: $userInfo.preferred_username } })}
		</p>
		<div class="flex justify-center gap-2">
			<span class="badge badge-accent badge-xl">
				<IconMdiAccount class="h-4 w-4" />
				<span class="">{$_('auth.role.user')}</span>
			</span>
			{#if $userInfo.isAdmin}
				<span class="badge badge-primary badge-xl">
					<IconMdiShieldAccount class="h-4 w-4" />
					<span class="">{$_('auth.role.admin')}</span>
				</span>
			{/if}
			{#if $userInfo.isModerator}
				<span class="badge badge-secondary badge-xl">
					<IconMdiShieldAccount class="h-4 w-4" />
					<span class="">{$_('auth.role.moderator')}</span>
				</span>
			{/if}
		</div>
	{:else}
		<p class="mb-2 text-center text-sm font-medium">{$_('settings.not_logged_in')}</p>
	{/if}

	<div class="divider my-4"></div>

	<p class="mb-4 font-semibold">{$_('settings.news')}</p>
	<news-feed
		url="https://raw.githubusercontent.com/openfoodfacts/smooth-app_assets/refs/heads/main/prod/tagline/web/main.json"
	></news-feed>

	<p class="mt-8 mb-4 font-semibold">{$_('settings.section_general')}</p>

	<div class="mx-auto grid w-max grid-cols-1 gap-4 md:grid-cols-[auto_1fr]">
		<label for="lang-select" class="flex items-center gap-2 justify-self-start md:justify-self-end">
			<IconMaterialTranslate class="h-5 w-5" />
			{$_('general.language')}:
		</label>
		<select
			class="select select-bordered w-full md:w-auto"
			name="lang-select"
			bind:value={$preferences.lang}
			onchange={() => locale.set($preferences.lang)}
		>
			<!--eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#each Object.keys(data.languages).toSorted() as langKey (langKey)}
				{@const lang = data.languages[langKey]}
				<option
					value={lang.language_code_2.en}
					selected={$preferences.lang === lang.language_code_2.en}
				>
					{lang.name['en']} ({lang.name[lang.language_code_2.en]})
				</option>
			{/each}
		</select>

		<label for="country-select" class="flex items-center gap-2">
			<IconMaterialPublic class="h-5 w-5" />
			{$_('general.country')}:
		</label>
		<select
			name="country-select"
			class="select select-bordered w-full md:w-auto"
			bind:value={$preferences.country}
		>
			<option value="world" selected={$preferences.country === 'world'}>
				{$_('world_option')}
			</option>

			<!--eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#each Object.keys(data.countries).toSorted() as countryKey (countryKey)}
				{@const country = data.countries[countryKey]}
				{@const code2 = country.country_code_2.en}
				<option
					value={code2}
					selected={$preferences.country === code2}
					class="overflow-hidden text-ellipsis"
				>
					{country.name['en']}
				</option>
			{/each}
		</select>

		<label for="currency-select" class="flex items-center gap-2">
			<IconMaterialUniversalCurrencyAlt class="h-5 w-5" />
			{$_('general.currency')}:
		</label>
		<select
			name="currency-select"
			class="select select-bordered w-full md:w-auto"
			bind:value={$preferences.currency}
		>
			{#each data.currencies as currency (currency)}
				<option value={currency} selected={$preferences.currency === currency}>
					{currency}
				</option>
			{/each}
		</select>
	</div>

	<p class="mt-8 mb-4 font-semibold">{$_('settings.section_editing')}</p>

	<div class="mx-auto grid w-max grid-cols-1 gap-4 md:grid-cols-[auto_1fr]">
		<label for="expanded-sections">
			{$_('settings.expand_all_sections')}:
		</label>
		<input
			id="expanded-sections"
			type="checkbox"
			class="toggle toggle-primary"
			bind:checked={$preferences.editing.expandAllSections}
		/>

		<label for="display-prices">
			{$_('settings.display_prices_in_search')}:
		</label>
		<input
			id="display-prices"
			type="checkbox"
			class="toggle toggle-primary"
			bind:checked={$preferences.displayPricesInSearch}
		/>
	</div>

	<p class="mt-8 mb-4 font-semibold">{$_('settings.influences')}</p>

	<!-- FIXME: Remove cast when id gets changes to a required property in SDK -->

	<PreferencesForm groups={attributeGroups as AttributeGroup[]} />
</div>

<div class="divider my-8"></div>

<div class="mt-8 flex justify-center">
	<a
		class="btn btn-outline"
		href={GITHUB_REPO_URL}
		target="_blank"
		aria-label={$_('settings.github_link')}
	>
		<IconMdiGithub class="h-5 w-5" />
		<span class="ml-2">{$_('settings.github_cta')}</span>
	</a>
</div>

<div class="divider my-8"></div>

<h2 class="my-4 text-center text-2xl font-bold">{$_('settings.dev_settings_title')}</h2>

<div class="mx-auto mb-8 grid w-max grid-cols-1 gap-4 md:grid-cols-[auto_1fr]">
	<label
		for="dev-mode-toggle"
		class="flex items-center gap-2 justify-self-start md:justify-self-end"
	>
		<IconMdiTools class="h-5 w-5" />
		{$_('settings.moderator_mode')}:
	</label>
	<input
		id="dev-mode-toggle"
		type="checkbox"
		class="toggle toggle-accent"
		bind:checked={$preferences.moderator}
	/>
</div>
