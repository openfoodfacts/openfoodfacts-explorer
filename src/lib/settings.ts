import { persisted } from 'svelte-local-storage-store';

export const preferences = persisted('preferences', {
	lang: 'en',
	nutriscoreInfluence: 50,
	ecoscoreInfluence: 50,
	novaGroupInfluence: 50,
});
