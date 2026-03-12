import { persisted } from 'svelte-local-storage-store';
import { get } from 'svelte/store';

const DEFAULT_PREFERENCES = {
	version: 4,
	lang: undefined as string | undefined,
	country: 'world',
	currency: 'USD',
	nutriscoreInfluence: 50,
	ecoscoreInfluence: 50,
	novaGroupInfluence: 50,

	prices: {
		authToken: null as string | null
	},

	editing: {
		expandAllSections: false
	},

	displayPricesInSearch: true,

	moderator: false
};

type Preferences = typeof DEFAULT_PREFERENCES;

export const preferences = persisted('preferences', DEFAULT_PREFERENCES);

export function runPreferencesMigrations() {
	let prefs = get(preferences);
	const currentVersion = prefs.version || 0;

	// Apply migrations sequentially
	let maxVersion = currentVersion;
	for (const migration of MIGRATIONS) {
		if (migration.version > currentVersion) {
			console.log(`Migrating preferences to version ${migration.version}`);
			prefs = migration.upgrade(prefs);
			prefs.version = migration.version;
			maxVersion = Math.max(maxVersion, migration.version);
		}
	}

	// Ensure the version is set to the latest after all migrations
	prefs.version = maxVersion;

	// Update the store with migrated preferences
	preferences.set(prefs);
}

const MIGRATIONS: {
	version: number;
	upgrade: (pref: Preferences) => Preferences;
}[] = [
	{
		version: 1,
		upgrade: (preferences) => {
			preferences.editing = {
				expandAllSections: false
			};
			return preferences;
		}
	},
	{
		version: 2,
		upgrade: (preferences) => {
			if (!('moderator' in preferences)) {
				// @ts-expect-error - adding new field
				preferences.moderator = false;
			}
			return preferences;
		}
	},
	{
		// 2026-02-06: Migrating to full OAuth tokens, removing username/password
		version: 3,
		upgrade: (preferences) => {
			if ('username' in preferences) {
				delete preferences.username;
			}
			if ('password' in preferences) {
				delete preferences.password;
			}
			if ('folksonomy' in preferences) {
				delete preferences.folksonomy;
			}
			return preferences;
		}
	},
	{
		version: 4,
		upgrade: (preferences) => {
			if (!('displayPricesInSearch' in preferences)) {
				// @ts-expect-error - adding new field
				preferences.displayPricesInSearch = true;
			}
			return preferences;
		}
	}
];
