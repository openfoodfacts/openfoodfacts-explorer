<script lang="ts">
	import { preferences } from '$lib/settings';
	import { _ } from '$lib/i18n';
	import { locale } from '$lib/i18n';
	import PreferencesForm from '$lib/ui/preferences/PreferencesForm.svelte';
	import type { AttributeGroup } from '$lib/stores/preferencesStore';
	import { userInfo } from '$lib/stores/user';
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
	import IconMdiMenu from '@iconify-svelte/mdi/menu';

	import type { PageProps } from './$types';

	const GITHUB_REPO_URL = 'https://github.com/openfoodfacts/openfoodfacts-explorer';

	let { data }: PageProps = $props();
	let { attributeGroups } = $derived(data);

	let activeTab = $state<'account' | 'general' | 'editing' | 'preferences' | 'developer'>(
		'account'
	);

	const tabs = [
		{ id: 'account', label: 'Account' },
		{ id: 'general', label: 'General' },
		{ id: 'editing', label: 'Editing' },
		{ id: 'preferences', label: 'Preferences' },
		{ id: 'developer', label: 'Developer' }
	] as const;
</script>

<Metadata title="Settings" description="Manage your preferences and account settings" />

<div class="bg-base-100 min-h-screen">
	<div class="mx-auto max-w-4xl px-4 py-8">
		<div class="mb-8">
			<h1 class="text-base-content text-4xl font-bold">{$_('settings_link')}</h1>
			<p class="text-base-content/70 mt-2">
				{$_('settings.subtitle')}
			</p>
		</div>

		<div role="tablist" class="tabs tabs-bordered mb-8 hidden gap-0 md:flex">
			<input
				type="radio"
				name="settings-tabs"
				role="tab"
				class="tab"
				aria-label="Account"
				bind:group={activeTab}
				value="account"
			/>
			<div
				role="tabpanel"
				class="tab-content hidden p-0"
				class:block={activeTab === 'account'}
			></div>

			<input
				type="radio"
				name="settings-tabs"
				role="tab"
				class="tab"
				aria-label="General"
				bind:group={activeTab}
				value="general"
			/>
			<div
				role="tabpanel"
				class="tab-content hidden p-0"
				class:block={activeTab === 'general'}
			></div>

			<input
				type="radio"
				name="settings-tabs"
				role="tab"
				class="tab"
				aria-label="Editing"
				bind:group={activeTab}
				value="editing"
			/>
			<div
				role="tabpanel"
				class="tab-content hidden p-0"
				class:block={activeTab === 'editing'}
			></div>

			<input
				type="radio"
				name="settings-tabs"
				role="tab"
				class="tab"
				aria-label="Preferences"
				bind:group={activeTab}
				value="preferences"
			/>
			<div
				role="tabpanel"
				class="tab-content hidden p-0"
				class:block={activeTab === 'preferences'}
			></div>

			<input
				type="radio"
				name="settings-tabs"
				role="tab"
				class="tab"
				aria-label="Developer"
				bind:group={activeTab}
				value="developer"
			/>
			<div
				role="tabpanel"
				class="tab-content hidden p-0"
				class:block={activeTab === 'developer'}
			></div>
		</div>

		<div class="mb-8 md:hidden">
			<div class="dropdown dropdown-bottom w-full">
				<button class="btn btn-block btn-outline gap-2" tabindex="0">
					<IconMdiMenu class="h-5 w-5" />
					{tabs.find((t) => t.id === activeTab)?.label || 'Settings'}
				</button>
				<ul class="dropdown-content menu bg-base-200 w-full p-2">
					{#each tabs as tab (tab.id)}
						<li>
							<button
								onclick={() => {
									activeTab = tab.id as typeof activeTab;
								}}
								class:active={activeTab === tab.id}
							>
								{tab.label}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		{#if activeTab === 'account'}
			<div class="space-y-6">
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
						<p class="mb-4">Help us improve Open Food Facts Explorer!</p>
						<a
							class="btn btn-primary-content btn-outline"
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
			<div class="card bg-base-200 shadow-md">
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
			<div class="card bg-base-200 shadow-md">
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
			<div class="card bg-base-200 shadow-md">
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

		{#if activeTab === 'developer'}
			<div class="card border-warning bg-warning/10 border-2 shadow-md">
				<div class="card-body">
					<h2 class="card-title flex items-center gap-2">
						<IconMdiTools class="h-6 w-6" />
						{$_('settings.dev_settings_title')}
					</h2>

					<p class="text-base-content/70 mt-4 text-sm">
						Be careful! These settings are intended for moderators and developers only.
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
								Enable moderator tools and advanced features
							</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
