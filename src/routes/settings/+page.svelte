<script lang="ts">
	import type { PageData } from './$types';
	import { preferences } from '$lib/settings';
	import Influence from './Influence.svelte';
	import Heading from './Heading.svelte';
	import { FolksonomyApi } from '$lib/api/folksonomy';
	import { t } from '$lib/translations';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	async function loginToFolksonomy() {
		const username = $preferences.username;
		const password = $preferences.password;
		if (username == null || password == null) throw new Error('Username or password is null');

		new FolksonomyApi(fetch).login(username, password);
	}
</script>

<div
	class="mx-auto my-8 grid grid-cols-1 items-center gap-x-4 gap-y-2 md:grid-cols-[1fr_max-content] md:gap-x-8"
>
	<Heading>General</Heading>
	<label for="lang-select" class="justify-self-start md:justify-self-end">Language:</label>
	<select
		class="select select-bordered w-full md:w-auto"
		name="lang-select"
		bind:value={$preferences.lang}
	>
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

	<label for="country-select" class="justify-self-start md:justify-self-end">Country:</label>
	<select
		name="country-select"
		class="select select-bordered w-full md:w-auto"
		bind:value={$preferences.country}
	>
		<option value="world" selected={$preferences.country === 'world'}>
			{$t('common.world')}
		</option>

		<!--eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		{#each Object.keys(data.countries).toSorted() as countryKey}
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

	<Heading>Influences</Heading>

	<label for="nutriscore" class="justify-self-start md:justify-self-end"
		>{$t('common.nutriscore')}</label
	>
	<Influence id="nutriscore" bind:value={$preferences.nutriscoreInfluence} />

	<label for="ecoscore" class="justify-self-start md:justify-self-end"
		>{$t('common.ecoscore')}</label
	>
	<Influence id="ecoscore" bind:value={$preferences.ecoscoreInfluence} />

	<label for="nova" class="justify-self-start md:justify-self-end">{$t('common.nova')}</label>
	<Influence id="nova" bind:value={$preferences.novaGroupInfluence} />

	<Heading>Login (saved in localStorage) [UNSAFE - DEBUG ONLY]</Heading>

	<label for="username" class="justify-self-start md:justify-self-end">Username</label>
	<input
		type="text"
		id="username"
		class="input input-bordered w-full md:w-auto"
		bind:value={$preferences.username}
	/>

	<label for="password" class="justify-self-start md:justify-self-end">Password</label>
	<input
		type="password"
		id="password"
		class="input input-bordered w-full md:w-auto"
		bind:value={$preferences.password}
	/>

	<label for="" class="justify-self-start md:justify-self-end">Login to folksonomy engine</label>

	<button
		disabled={$preferences.username == null || $preferences.password == null}
		class="btn btn-primary w-full md:w-auto"
		onclick={loginToFolksonomy}
	>
		Login
	</button>
</div>
