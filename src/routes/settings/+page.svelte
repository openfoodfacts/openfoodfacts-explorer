<script lang="ts">
	import type { PageData } from './$types';
	import { preferences } from '$lib/settings';
	import Influence from './Influence.svelte';
	import Heading from './Heading.svelte';
	import { createFolksonomyApi, updateFolksonomyAuthToken } from '$lib/api/folksonomy';
	import { _ } from '$lib/i18n';
	import { fade } from 'svelte/transition';
	import { locale } from '$lib/i18n';

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

<div
	class="mx-auto my-8 grid grid-cols-1 items-center gap-x-4 gap-y-2 md:grid-cols-[1fr_max-content] md:gap-x-8"
>
	<Heading>{$_('settings.general')}</Heading>
	<label for="lang-select" class="justify-self-start md:justify-self-end"
		>{$_('general.language')}:</label
	>
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

	<label for="country-select" class="justify-self-start md:justify-self-end"
		>{$_('general.country')}:</label
	>
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

	<Heading>{$_('settings.influences')}</Heading>

	<label for="nutriscore" class="justify-self-start md:justify-self-end">{$_('nutriscore')}</label>
	<Influence id="nutriscore" bind:value={$preferences.nutriscoreInfluence} />

	<label for="ecoscore" class="justify-self-start md:justify-self-end">{$_('ecoscore')}</label>
	<Influence id="ecoscore" bind:value={$preferences.ecoscoreInfluence} />

	<label for="nova" class="justify-self-start md:justify-self-end">{$_('nova')}</label>
	<Influence id="nova" bind:value={$preferences.novaGroupInfluence} />

	<Heading>{$_('settings.login')}</Heading>

	{#if isAuthenticated}
		<span class="justify-self-start text-sm font-medium md:justify-self-end"
			>{$_('auth.status')}</span
		>
		<div class="flex items-center gap-2">
			<span class="badge badge-success">
				<span class="icon-[mdi--check-circle] h-4 w-4"></span>
			</span>
			<span class="font-medium">{$_('auth.authenticated')}</span>
		</div>

		<span class="justify-self-start text-sm font-medium md:justify-self-end"
			>{$_('auth.actions')}</span
		>
		<button
			class="btn btn-sm btn-outline btn-error w-full md:w-auto"
			onclick={logout}
			transition:fade={{ duration: 200 }}
		>
			<span class="icon-[mdi--logout] mr-1 h-4 w-4"></span>
			{$_('auth.signout')}
		</button>
	{:else}
		<label for="username" class="justify-self-start md:justify-self-end"
			>{$_('auth.username')}</label
		>
		<div class="form-control w-full md:w-auto">
			<input
				type="text"
				id="username"
				class="input input-sm input-bordered w-full"
				bind:value={$preferences.username}
				placeholder={$_('auth.enter_username')}
			/>
		</div>

		<label for="password" class="justify-self-start md:justify-self-end"
			>{$_('auth.password')}</label
		>
		<div class="form-control w-full md:w-auto">
			<input
				type="password"
				id="password"
				class="input input-sm input-bordered w-full"
				bind:value={$preferences.password}
				placeholder={$_('auth.enter_password')}
			/>
		</div>

		<span class="justify-self-start text-sm font-medium md:justify-self-end">Authentication</span>
		<div class="flex w-full flex-col gap-2 md:w-auto">
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

<div class="divider my-8"></div>

<div class="mt-8 flex justify-center">
	<a class="btn btn-outline" href={GITHUB_REPO_URL} target="_blank" aria-label="GitHub">
		<span class="icon-[mdi--github] text-xl"></span>
		<span class="ml-2">Help us improve Explorer on GitHub</span>
	</a>
</div>
