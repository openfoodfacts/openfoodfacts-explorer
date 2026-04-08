<script lang="ts">
	import { preferences } from '$lib/settings';
	import { _ } from '$lib/i18n';
	import { locale } from '$lib/i18n';
	import PreferencesForm from '$lib/ui/preferences/PreferencesForm.svelte';
	import Tabs from '$lib/ui/Tabs.svelte';
	import type { AttributeGroup } from '$lib/stores/preferencesStore';
	import { userInfo, getPermissionsCtx } from '$lib/stores/user';
	import Metadata from '$lib/Metadata.svelte';

	import IconMdiAccount from '@iconify-svelte/mdi/account';
	import IconMaterialTranslate from '@iconify-svelte/material-symbols/translate';
	import IconMaterialPublic from '@iconify-svelte/material-symbols/public';
	import IconMaterialUniversalCurrencyAlt from '@iconify-svelte/material-symbols/universal-currency-alt';
	import IconMdiGithub from '@iconify-svelte/mdi/github';
	import IconMdiTools from '@iconify-svelte/mdi/tools';
	import IconMdiCog from '@iconify-svelte/mdi/cog';
	import IconMdiPencil from '@iconify-svelte/mdi/pencil';
	import IconMdiHeart from '@iconify-svelte/mdi/heart';

	import type { PageProps } from './$types';

	const GITHUB_REPO_URL = 'https://github.com/openfoodfacts/openfoodfacts-explorer';

	let { data }: PageProps = $props();
	let { attributeGroups } = $derived(data);

	let activeTab = $state<'account' | 'general' | 'editing' | 'preferences' | 'developer'>(
		'account'
	);
	let permissions = $derived(getPermissionsCtx());

	const tabNames = ['account', 'general', 'editing', 'preferences', 'developer'] as const;
</script>

<Metadata title={$_('settings.page_title')} description={$_('settings.page_description')} />

<div class="bg-base-100 min-h-screen">
	<div class="mx-auto max-w-4xl px-4 py-8">
		<div class="mb-8">
			<h1 class="text-base-content text-4xl font-bold">{$_('settings_link')}</h1>
			<p class="text-base-content/70 mt-2">
				{$_('settings.subtitle')}
			</p>
		</div>

		<Tabs
			tabs={tabNames}
			{activeTab}
			groupName="settings-tabs"
			i18nPrefix="settings.tab"
			onTabChange={(tab) => {
				activeTab = tab as typeof activeTab;
			}}
		/>

		{#if activeTab === 'account'}
			<div role="tabpanel" id="tabpanel-account" aria-labelledby="tab-account" class="space-y-6">
				<div class="card bg-base-200 shadow-md">
					<div class="card-body">
						<h2 class="card-title flex items-center gap-2">
							<IconMdiAccount class="h-6 w-6" />
							{$_('settings.section_user')}
						</h2>

						{#if $userInfo}
							<div class="mt-4 space-y-4">
								<div>
									<p class="text-base-content/70 text-sm">{$_('settings.username')}</p>
									<p class="text-lg font-semibold">{$userInfo.preferred_username}</p>
								</div>
								<div>
									<p class="text-base-content/70 mb-2 text-sm">{$_('settings.email')}</p>
									<p class="text-lg font-semibold">{$userInfo.email}</p>
								</div>
								{#if $userInfo.roles && $userInfo.roles.length > 0}
									<div>
										<p class="text-base-content/70 mb-2 text-sm">{$_('settings.roles')}</p>
										<div class="flex flex-wrap gap-2">
											{#each $userInfo.roles as role (role)}
												<span class="badge badge-primary">
													{role}
												</span>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{:else}
							<div class="alert alert-info">
								<div>
									<p class="text-sm">{$_('settings.not_logged_in')}</p>
								</div>
							</div>
						{/if}
					</div>
				</div>
				<div class="card bg-base-200 shadow-md">
					<div class="card-body">
						<h2 class="card-title">{$_('settings.news')}</h2>
						<div class="mt-4">
							<news-feed
								url="https://raw.githubusercontent.com/openfoodfacts/smooth-app_assets/refs/heads/main/prod/tagline/web/main.json"
							></news-feed>
						</div>
					</div>
				</div>

				<div class="card bg-primary text-primary-content shadow-md">
					<div class="card-body">
						<p class="mb-4">{$_('settings.github_help_text')}</p>
						<a
							class="btn btn-primary"
							href={GITHUB_REPO_URL}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={$_('settings.github_link')}
						>
							<IconMdiGithub class="h-5 w-5" />
							<span>{$_('settings.github_cta')}</span>
						</a>
					</div>
				</div>
			</div>
		{/if}

		{#if activeTab === 'general'}
			<div
				role="tabpanel"
				id="tabpanel-general"
				aria-labelledby="tab-general"
				class="card bg-base-200 shadow-md"
			>
				<div class="card-body">
					<h2 class="card-title flex items-center gap-2">
						<IconMdiCog class="h-6 w-6" />
						{$_('settings.section_general')}
					</h2>

					<div class="mt-6 space-y-6">
						<div class="form-control">
							<label class="label">
								<span class="label-text flex items-center gap-2 font-semibold">
									<IconMaterialTranslate class="h-5 w-5" />
									{$_('general.language')}
								</span>
							</label>
							<select
								class="select select-bordered w-full"
								name="lang-select"
								bind:value={$preferences.lang}
								onchange={() => locale.set($preferences.lang)}
							>
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
						</div>

						<div class="form-control">
							<label class="label">
								<span class="label-text flex items-center gap-2 font-semibold">
									<IconMaterialPublic class="h-5 w-5" />
									{$_('general.country')}
								</span>
							</label>
							<select
								name="country-select"
								class="select select-bordered w-full"
								bind:value={$preferences.country}
							>
								<option value="world" selected={$preferences.country === 'world'}>
									{$_('world_option')}
								</option>

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
						</div>

						<div class="form-control">
							<label class="label">
								<span class="label-text flex items-center gap-2 font-semibold">
									<IconMaterialUniversalCurrencyAlt class="h-5 w-5" />
									{$_('general.currency')}
								</span>
							</label>
							<select
								name="currency-select"
								class="select select-bordered w-full"
								bind:value={$preferences.currency}
							>
								{#each data.currencies as currency (currency)}
									<option value={currency} selected={$preferences.currency === currency}>
										{currency}
									</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if activeTab === 'editing'}
			<div
				role="tabpanel"
				id="tabpanel-editing"
				aria-labelledby="tab-editing"
				class="card bg-base-200 shadow-md"
			>
				<div class="card-body">
					<h2 class="card-title flex items-center gap-2">
						<IconMdiPencil class="h-6 w-6" />
						{$_('settings.section_editing')}
					</h2>

					<div class="mt-6 space-y-6">
						<div class="form-control">
							<label class="label cursor-pointer">
								<span class="label-text font-semibold">{$_('settings.expand_all_sections')}</span>
								<input
									id="expanded-sections"
									type="checkbox"
									class="toggle toggle-primary"
									bind:checked={$preferences.editing.expandAllSections}
								/>
							</label>
							<p class="text-base-content/70 mt-1 text-xs">
								{$_('settings.expand_all_sections_help')}
							</p>
						</div>

						<div class="form-control">
							<label class="label cursor-pointer">
								<span class="label-text font-semibold"
									>{$_('settings.display_prices_in_search')}</span
								>
								<input
									id="display-prices"
									type="checkbox"
									class="toggle toggle-primary"
									bind:checked={$preferences.displayPricesInSearch}
								/>
							</label>
							<p class="text-base-content/70 mt-1 text-xs">
								{$_('settings.display_prices_in_search_help')}
							</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if activeTab === 'preferences'}
			<div
				role="tabpanel"
				id="tabpanel-preferences"
				aria-labelledby="tab-preferences"
				class="card bg-base-200 shadow-md"
			>
				<div class="card-body">
					<h2 class="card-title flex items-center gap-2">
						<IconMdiHeart class="h-6 w-6" />
						{$_('settings.influences')}
					</h2>

					<div class="mt-6">
						<PreferencesForm groups={attributeGroups as AttributeGroup[]} />
					</div>
				</div>
			</div>
		{/if}

		{#if activeTab === 'developer' && permissions.isModerator}
			<div
				role="tabpanel"
				id="tabpanel-developer"
				aria-labelledby="tab-developer"
				class="card border-warning bg-warning/10 border-2 shadow-md"
			>
				<div class="card-body">
					<h2 class="card-title flex items-center gap-2">
						<IconMdiTools class="h-6 w-6" />
						{$_('settings.dev_settings_title')}
					</h2>

					<p class="text-base-content/70 mt-4 text-sm">
						{$_('settings.dev_warning')}
					</p>

					<div class="mt-6">
						<div class="form-control">
							<label class="label cursor-pointer">
								<span class="label-text font-semibold">{$_('settings.moderator_mode')}</span>
								<input
									id="dev-mode-toggle"
									type="checkbox"
									class="toggle toggle-accent"
									bind:checked={$preferences.moderator}
								/>
							</label>
							<p class="text-base-content/70 mt-1 text-xs">
								{$_('settings.moderator_mode_help')}
							</p>
						</div>
					</div>
				</div>
			</div>
		{:else if activeTab === 'developer'}
			<div
				role="tabpanel"
				id="tabpanel-developer"
				aria-labelledby="tab-developer"
				class="alert alert-warning"
			>
				<div>
					<p class="font-semibold">{$_('settings.dev_access_denied')}</p>
					<p class="mt-1 text-sm">{$_('settings.dev_access_message')}</p>
				</div>
			</div>
		{/if}
	</div>
</div>
