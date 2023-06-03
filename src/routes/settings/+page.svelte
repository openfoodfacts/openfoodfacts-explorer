<script lang="ts">
	import type { PageData } from './$types';
	import { preferences } from '$lib/settings';
	import Influence from './Influence.svelte';
	import Heading from './Heading.svelte';

	export let data: PageData;

	$: languages = Object.entries(data.languages);
</script>

<div class="grid grid-cols-[1fr,max-content] mx-auto my-8 gap-y-2 gap-x-8 items-center">
	<Heading>General</Heading>
	<label for="lang-select" class="justify-self-end">Language:</label>
	<select class="select" name="lang-select" bind:value={$preferences.lang}>
		{#each languages as [_, lang]}
			<option
				value={lang.language_code_2.en}
				selected={$preferences.lang === lang.language_code_2.en}
			>
				{lang.name[lang.language_code_2.en]}
			</option>
		{/each}
	</select>

	<Heading>Influences</Heading>

	<label for="nutriscore" class="justify-self-end">Nutriscore:</label>
	<Influence id="nutriscore" bind:value={$preferences.nutriscoreInfluence} />

	<label for="ecoscore" class="justify-self-end">Ecoscore:</label>
	<Influence id="ecoscore" bind:value={$preferences.ecoscoreInfluence} />

	<label for="nova" class="justify-self-end">Nova:</label>
	<Influence id="nova" bind:value={$preferences.novaGroupInfluence} />
</div>
