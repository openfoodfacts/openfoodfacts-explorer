import { persisted } from 'svelte-local-storage-store';

export const preferences = persisted('preferences', {
	lang: 'en',
	country: 'world',
	nutriscoreInfluence: 50,
	ecoscoreInfluence: 50,
	novaGroupInfluence: 50,
	folksonomy: {
		authToken: null as string | null
	},
	username: null as string | null,
	password: null as string | null
});

export const themes = [
	'light',
	'dark',
] as const;
type Theme = (typeof themes)[number];

export interface Settings {
	theme: Theme;
}

const settings = persisted<Settings>('settings', {
	theme: 'dark',
});

export default settings;
