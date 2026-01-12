<script lang="ts">
	import * as publicEnv from '$env/dynamic/public';

	import { preferences } from '$lib/settings';
	import { createFolksonomyApi, updateFolksonomyAuthToken } from '$lib/api/folksonomy';
	import { _ } from '$lib/i18n';
	import { locale } from '$lib/i18n';
	import PreferencesForm from '$lib/ui/PreferencesForm.svelte';
	import type { AttributeGroup } from '$lib/stores/preferencesStore';

	import type { PageProps } from './$types';
	import { createProductsApi } from '$lib/api';

	const GITHUB_REPO_URL = 'https://github.com/openfoodfacts/openfoodfacts-explorer';

	let { data }: PageProps = $props();
	let { loginStatus } = $derived(data);

	let isFolksonomyAuthenticated = $derived($preferences.folksonomy.authToken !== null);

	type LoginResult = { success: false; error: string } | { success: true };

	// Login Process
	let isLoggingIn: boolean = $state(false);
	let folksonomyLoginStatus: Promise<LoginResult> | undefined = $state(undefined);
	let productLoginStatus: Promise<LoginResult> | undefined = $state(undefined);

	async function login() {
		const { username, password } = $preferences;
		if (username == null || password == null) throw new Error('Username or password is null');

		isLoggingIn = true;
		try {
			folksonomyLoginStatus = loginToFolksonomy(username, password);
			productLoginStatus = loginToPO(username, password);
			await Promise.all([folksonomyLoginStatus, productLoginStatus]);
		} finally {
			isLoggingIn = false;
		}

		setTimeout(() => {
			folksonomyLoginStatus = undefined;
			productLoginStatus = undefined;
		}, 5000);
	}

	async function loginToPO(username: string, password: string): Promise<LoginResult> {
		const { data, error } = await createProductsApi(fetch).apiv2.client.POST('/cgi/session.pl', {
			body: { user_id: username, password: password }
		});

		if (error || !data) {
			return { success: false, error: 'Login failed' };
		}

		return { success: true };
	}

	async function loginToFolksonomy(username: string, password: string): Promise<LoginResult> {
		const folksonomyApi = createFolksonomyApi(fetch);
		const { data, error } = await folksonomyApi.login(username, password);
		if (error || !data) {
			updateFolksonomyAuthToken(null);
			return { success: false, error: 'Login failed' };
		}

		updateFolksonomyAuthToken(data.access_token);
		return { success: true };
	}

	function logout() {
		preferences.update((p) => ({
			...p,
			folksonomy: { ...p.folksonomy, authToken: null },
			username: null,
			password: null
		}));
	}
</script>

<div class="mx-auto my-8">
	<p class="mb-4 font-semibold">{$_('settings.section_user')}</p>
	{#if loginStatus?.user}
		<p class="mb-4 text-center text-xl font-medium">
			{$_('settings.logged_in_as', { values: { username: loginStatus.user.name } })}
		</p>
		<div class="flex justify-center gap-2">
			{#if loginStatus.user.admin}
				<span class="badge badge-primary badge-xl">
					<span class="icon-[mdi--shield-account]"></span>
					<span class="">{$_('auth.admin')}</span>
				</span>
			{/if}
			{#if loginStatus.user.moderator}
				<span class="badge badge-secondary badge-xl">
					<span class="icon-[mdi--shield-account]"></span>
					<span class="">{$_('auth.moderator')}</span>
				</span>
			{:else}
				<span class="badge badge-accent badge-xl">
					<span class="icon-[mdi--account]"></span>
					<span class="">{$_('auth.user')}</span>
				</span>
			{/if}
		</div>
	{:else}
		<p class="mb-2 text-center text-sm font-medium">{$_('settings.not_logged_in')}</p>
	{/if}

	<div class="divider my-4"></div>

	<div class="mt-4 mb-2 text-center text-sm font-medium">
		{#if isFolksonomyAuthenticated}
			<div class="text-success my-2">
				<span class="icon-[mdi--check-circle] mr-1"></span>
				{$_('Folksonomy API: Authenticated')}
			</div>
			<button class="btn btn-xs btn-outline ml-2" onclick={logout}>
				<span class="icon-[mdi--logout] mr-1"></span>
				{$_('auth.signout')}
			</button>
		{:else}
			<span class="text-error">
				<span class="icon-[mdi--alert-circle] mr-1"></span>
				{$_('Folksonomy API: Not authenticated')}
			</span>
		{/if}
	</div>

	<p class="mb-4 font-semibold">{$_('settings.news')}</p>
	<news-feed
		url="https://raw.githubusercontent.com/openfoodfacts/smooth-app_assets/refs/heads/main/prod/tagline/web/main.json"
	></news-feed>

	<p class="mt-8 mb-4 font-semibold">{$_('settings.section_general')}</p>

	<div class="mx-auto grid w-max grid-cols-1 gap-4 md:grid-cols-[auto_1fr]">
		<label for="lang-select" class="flex items-center gap-2 justify-self-start md:justify-self-end">
			<span class="icon-[material-symbols--translate] text-xl"></span>
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
			<span class="icon-[material-symbols--public] text-xl"></span>
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
			<span class="icon-[material-symbols--universal-currency-alt] text-xl"></span>
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
	</div>

	<p class="mt-8 mb-4 font-semibold">{$_('settings.influences')}</p>

	<!-- FIXME: Remove cast when id gets changes to a required property in SDK -->
	<PreferencesForm groups={data.attributeGroups as AttributeGroup[]} />

	<div class="my-8">
		<p class="mt-8 mb-4 font-semibold">{$_('settings.login')}</p>

		<label class="my-2 block">
			<p>{$_('auth.username')}</p>

			<input
				type="text"
				class="input input-sm input-bordered w-full"
				bind:value={$preferences.username}
				placeholder={$_('auth.enter_username')}
			/>
		</label>

		<label class="my-2 block">
			<p>{$_('auth.password')}</p>

			<input
				type="password"
				class="input input-sm input-bordered w-full"
				bind:value={$preferences.password}
				placeholder={$_('auth.enter_password')}
			/>
		</label>

		<div class="my-2 flex w-full flex-col gap-2 md:w-auto">
			<button
				disabled={$preferences.username == null || $preferences.password == null || isLoggingIn}
				class="btn btn-sm btn-primary w-full"
				onclick={login}
				id="login-button"
			>
				{#if isLoggingIn}
					<span class="loading loading-spinner loading-xs"></span>
					{$_('auth.authenticating')}
				{:else}
					<span class="icon-[mdi--login] mr-1 h-4 w-4"></span> {$_('auth.signin')}
				{/if}
			</button>

			{#if folksonomyLoginStatus !== undefined}
				{#await folksonomyLoginStatus}
					<p class="text-sm">Folksonomy: {$_('auth.authenticating')}</p>
				{:then result}
					{#if result.success}
						<p class="text-success text-sm">Folksonomy: {$_('auth.login_successful')}</p>
					{:else}
						<p class="text-error text-sm">Folksonomy: {result.error}</p>
					{/if}
				{/await}
			{/if}

			{#if productLoginStatus !== undefined}
				{#await productLoginStatus}
					<p class="text-sm">Product Opener: {$_('auth.authenticating')}</p>
				{:then result}
					{#if result.success}
						<p class="text-success text-sm">Product Opener: {$_('auth.login_successful')}</p>
					{:else}
						<p class="text-error text-sm">Product Opener: {result.error}</p>
					{/if}
				{/await}
			{/if}
		</div>
	</div>
</div>

<div class="divider my-8"></div>

<div class="mt-8 flex justify-center">
	<a class="btn btn-outline" href={GITHUB_REPO_URL} target="_blank" aria-label="GitHub">
		<span class="icon-[mdi--github] text-xl"></span>
		<span class="ml-2">Help us improve Explorer on GitHub</span>
	</a>
</div>

<div class="divider my-8"></div>

<h2 class="mb-4 text-center text-2xl font-bold">Environment Variables</h2>

<table class="table-zebra table-sm mb-8 table w-full">
	<thead>
		<tr>
			<th class="text-end">Variable</th>
			<th>Value</th>
		</tr>
	</thead>
	<tbody>
		{#each Object.entries(publicEnv) as [key, value] (key)}
			<tr>
				<td class="text-end font-bold">{key}</td>
				<td class="font-mono break-all">{value}</td>
			</tr>
		{/each}
	</tbody>
</table>

<h2 class="my-4 text-center text-2xl font-bold">Development Settings</h2>

<div class="mx-auto mb-8 grid w-max grid-cols-1 gap-4 md:grid-cols-[auto_1fr]">
	<label
		for="dev-mode-toggle"
		class="flex items-center gap-2 justify-self-start md:justify-self-end"
	>
		<span class="icon-[mdi--tools] text-xl"></span>
		Moderator Mode:
	</label>
	<input
		id="dev-mode-toggle"
		type="checkbox"
		class="toggle toggle-accent"
		bind:checked={$preferences.moderator}
	/>
</div>
