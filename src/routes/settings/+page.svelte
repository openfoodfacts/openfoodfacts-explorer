<script lang="ts">
	import type { PageData } from './$types';
	import { preferences } from '$lib/settings';
	import { createFolksonomyApi, updateFolksonomyAuthToken } from '$lib/api/folksonomy';
	import { _ } from '$lib/i18n';
	import { fade } from 'svelte/transition';
	import { locale } from '$lib/i18n';
	import PreferencesForm from '$lib/ui/PreferencesForm.svelte';

	const GITHUB_REPO_URL = 'https://github.com/openfoodfacts/openfoodfacts-explorer';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let isLoggingIn: boolean = $state(false);

	let isAuthenticated = $derived($preferences.folksonomy.authToken !== null);
	let loginStatus: undefined | boolean = $state();

	async function loginToFolksonomy() {
		isLoggingIn = true;
		const username = $preferences.username;
		const password = $preferences.password;
		if (username == null || password == null) throw new Error('Username or password is null');

		try {
			const folksonomyApi = createFolksonomyApi(fetch);
			const response = await folksonomyApi.login(username, password);
			loginStatus = true;
			setTimeout(() => {
				loginStatus = undefined;
			}, 3000);

			if (!('error' in response)) {
				updateFolksonomyAuthToken(response?.token?.access_token ?? null);
			} else {
				loginStatus = false;
				updateFolksonomyAuthToken(null);
			}
		} catch (error) {
			console.error('Error while logging in', error);
			loginStatus = false;
			setTimeout(() => {
				loginStatus = undefined;
			}, 3000);
		} finally {
			isLoggingIn = false;
		}
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
	<p class="mt-8 mb-4 font-semibold">{$_('settings.general')}</p>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<label for="lang-select" class="justify-self-start md:justify-self-end">
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

		<label for="country-select" class="justify-self-start md:justify-self-end">
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

		<label for="currency-select" class="justify-self-start md:justify-self-end">
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

	<p class="mt-8 mb-4 font-semibold">{$_('settings.influences')}</p>

	<PreferencesForm attributeGroups={data.attributeGroups} />

	<div class="my-8">
		<p class="mt-8 mb-4 font-semibold">{$_('settings.login')}</p>

		{#if isAuthenticated}
			<p class="my-2 text-sm font-medium md:justify-self-end">
				{$_('auth.status')}
			</p>

			<span class="badge badge-success badge-xl w-full">
				<span class="icon-[mdi--check-circle]"></span>
				<span class="">{$_('auth.authenticated')}</span>
			</span>

			<p class="mt-2 text-sm font-medium">
				{$_('auth.actions')}
			</p>

			<button
				class="btn btn-sm btn-outline btn-error w-full"
				onclick={logout}
				transition:fade={{ duration: 200 }}
			>
				<span class="icon-[mdi--logout]"></span>
				{$_('auth.signout')}
			</button>
		{:else}
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
					onclick={loginToFolksonomy}
					id="login-button"
				>
					{#if isLoggingIn}
						<span class="loading loading-spinner loading-xs"></span>
						{$_('auth.authenticating')}
					{:else}
						<span class="icon-[mdi--login] mr-1 h-4 w-4"></span> {$_('auth.signin')}
					{/if}
				</button>

				{#if loginStatus !== undefined}
					<div
						class="alert {loginStatus ? 'alert-success' : 'alert-error'} px-3 py-2"
						transition:fade={{ duration: 200 }}
					>
						{#if loginStatus}
							<span class="icon-[mdi--check-circle] h-4 w-4"></span>
							<span class="text-sm">{$_('auth.success')}</span>
						{:else}
							<span class="icon-[mdi--alert-circle] h-4 w-4"></span>
							<span class="text-sm">{$_('auth.failed')}</span>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<div class="divider my-8"></div>

<div class="mt-8 flex justify-center">
	<a class="btn btn-outline" href={GITHUB_REPO_URL} target="_blank" aria-label="GitHub">
		<span class="icon-[mdi--github] text-xl"></span>
		<span class="ml-2">Help us improve Explorer on GitHub</span>
	</a>
</div>
