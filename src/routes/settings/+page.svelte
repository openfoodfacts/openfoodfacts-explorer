<script lang="ts">
	import type { PageData } from './$types';
	import { preferences } from '$lib/settings';

	export let data: PageData;

	$: languages = Object.entries(data.languages);

	let langSelect: HTMLSelectElement;
	function setLangSelect() {
		preferences.update((old) => ({
			...old,
			lang: langSelect.value
		}));
	}
</script>

<select bind:this={langSelect} on:change={setLangSelect}>
	{#each languages as [_, lang]}
		<option
			value={lang.language_code_2.en}
			selected={$preferences.lang === lang.language_code_2.en}
		>
			{lang.name[lang.language_code_2.en]}
		</option>
	{/each}
</select>
