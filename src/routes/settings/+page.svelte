<script lang="ts">
	import type { PageData } from './$types';
	import { preferences } from '$lib/settings';
	import Influence from './Influence.svelte';
	import Heading from './Heading.svelte';
	import { FolksonomyApi } from '$lib/api/folksonomy';
	import { t } from '$lib/translations';

	export let data: PageData;

	async function loginToFolksonomy() {
		const username = $preferences.username;
		const password = $preferences.password;
		if (username == null || password == null) throw new Error('Username or password is null');

		new FolksonomyApi(fetch).login(username, password);
	}
</script>

<div class="mx-auto my-8 grid grid-cols-[1fr,max-content] items-center gap-x-8 gap-y-2">
	<Heading>General</Heading>
	<label for="lang-select" class="justify-self-end">Language:</label>
	<select class="select select-bordered" name="lang-select" bind:value={$preferences.lang}>
		<!--eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		{#each Object.keys(data.languages).toSorted() as langKey}
			{@const lang = data.languages[langKey]}
			<option
				value={lang.language_code_2.en}
				selected={$preferences.lang === lang.language_code_2.en}
			>
				{lang.name['en']} ({lang.name[lang.language_code_2.en]})
			</option>
		{/each}
	</select>

	<label for="country-select" class="justify-self-end">Country:</label>
	<select name="country-select" class="select select-bordered" bind:value={$preferences.country}>
		<option value="world" selected={$preferences.country === 'world'}>
			{$t('common.world')}
		</option>

		<!--eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		{#each Object.keys(data.countries).toSorted() as countryKey}
			{@const country = data.countries[countryKey]}
			{@const code2 = country.country_code_2.en}
			<option value={code2} selected={$preferences.country === code2}>
				{country.name['en']} ({country.name[$preferences.lang]})
			</option>
		{/each}
	</select>

	<Heading>Influences</Heading>

	<label for="nutriscore" class="justify-self-end">{$t('common.nutriscore')}</label>
	<Influence id="nutriscore" bind:value={$preferences.nutriscoreInfluence} />

	<label for="ecoscore" class="justify-self-end">{$t('common.ecoscore')}</label>
	<Influence id="ecoscore" bind:value={$preferences.ecoscoreInfluence} />

	<label for="nova" class="justify-self-end">{$t('common.nova')}</label>
	<Influence id="nova" bind:value={$preferences.novaGroupInfluence} />

	<Heading>Login (saved in localStorage) [UNSAFE - DEBUG ONLY]</Heading>

	<label for="username">Username</label>
	<input
		type="text"
		id="username"
		class="input input-bordered"
		bind:value={$preferences.username}
	/>

	<label for="password">Password</label>
	<input
		type="password"
		id="password"
		class="input input-bordered"
		bind:value={$preferences.password}
	/>

	<label for="">Login to folksonomy engine</label>

	<button
		disabled={$preferences.username == null || $preferences.password == null}
		class="btn btn-primary"
		on:click={loginToFolksonomy}
	>
		Login
	</button>
</div>
