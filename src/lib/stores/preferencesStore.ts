import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Define the preferences structure
export type NutritionalQuality = {
	nutriScore: string;
	saltInLowQuantity: string;
	sugarsInLowQuantity: string;
	fatInLowQuantity: string;
	saturatedFatInLowQuantity: string;
};

export type FoodProcessing = {
	novaGroup: string;
	noOrFewAdditives: string;
};

export type Allergens = {
	withoutGluten: string;
	withoutMilk: string;
	withoutEggs: string;
	withoutNuts: string;
	withoutPeanuts: string;
	withoutSesameSeeds: string;
	withoutSoybeans: string;
	withoutCelery: string;
	withoutMustard: string;
	withoutLupin: string;
	withoutFish: string;
	withoutCrustaceans: string;
	withoutMolluscs: string;
	withoutSulphurDioxideAndSulphites: string;
};

export type Ingredients = {
	vegan: string;
	vegetarian: string;
	palmOilFree: string;
};

export type Labels = {
	organicFarming: string;
	fairTrade: string;
};

export type Environment = {
	lowEnvironmentalImpact: string;
	lowRiskOfDeforestation: string;
};

export type UserPreferences = {
	nutritionalQuality: NutritionalQuality;
	foodProcessing: FoodProcessing;
	allergens: Allergens;
	ingredients: Ingredients;
	labels: Labels;
	environment: Environment;
};

// Default preferences
export const defaultPreferences: UserPreferences = {
	nutritionalQuality: {
		nutriScore: 'very-important',
		saltInLowQuantity: 'not-important',
		sugarsInLowQuantity: 'not-important',
		fatInLowQuantity: 'not-important',
		saturatedFatInLowQuantity: 'not-important'
	},
	foodProcessing: {
		novaGroup: 'important',
		noOrFewAdditives: 'not-important'
	},
	allergens: {
		withoutGluten: 'not-important',
		withoutMilk: 'not-important',
		withoutEggs: 'not-important',
		withoutNuts: 'not-important',
		withoutPeanuts: 'not-important',
		withoutSesameSeeds: 'not-important',
		withoutSoybeans: 'not-important',
		withoutCelery: 'not-important',
		withoutMustard: 'not-important',
		withoutLupin: 'not-important',
		withoutFish: 'not-important',
		withoutCrustaceans: 'not-important',
		withoutMolluscs: 'not-important',
		withoutSulphurDioxideAndSulphites: 'not-important'
	},
	ingredients: {
		vegan: 'not-important',
		vegetarian: 'not-important',
		palmOilFree: 'not-important'
	},
	labels: {
		organicFarming: 'not-important',
		fairTrade: 'not-important'
	},
	environment: {
		lowEnvironmentalImpact: 'important',
		lowRiskOfDeforestation: 'not-important'
	}
};

// Get initial preferences from localStorage or use defaults
function getInitialPreferences(): UserPreferences {
	if (browser) {
		try {
			const stored = localStorage.getItem('userPreferences');
			if (stored) {
				return JSON.parse(stored);
			}
		} catch (error) {
			console.warn('Failed to parse stored preferences, using defaults:', error);
		}
	}
	return structuredClone(defaultPreferences);
}

// Create the writable store
function createPreferencesStore() {
	const { subscribe, set, update } = writable<UserPreferences>(getInitialPreferences());

	return {
		subscribe,
		set,
		update,
		// Update a specific preference
		updatePreference: (category: keyof UserPreferences, preference: string, value: string) => {
			update((prefs) => {
				const newPrefs = { ...prefs };

				// Type-safe preference update
				if (category === 'nutritionalQuality') {
					(newPrefs.nutritionalQuality as Record<string, string>)[preference] = value;
				} else if (category === 'foodProcessing') {
					(newPrefs.foodProcessing as Record<string, string>)[preference] = value;
				} else if (category === 'allergens') {
					(newPrefs.allergens as Record<string, string>)[preference] = value;
				} else if (category === 'ingredients') {
					(newPrefs.ingredients as Record<string, string>)[preference] = value;
				} else if (category === 'labels') {
					(newPrefs.labels as Record<string, string>)[preference] = value;
				} else if (category === 'environment') {
					(newPrefs.environment as Record<string, string>)[preference] = value;
				}

				// Save to localStorage
				if (browser) {
					try {
						localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
					} catch (error) {
						console.warn('Failed to save preferences to localStorage:', error);
					}
				}

				return newPrefs;
			});
		},
		// Reset to default preferences
		resetToDefaults: () => {
			const defaults = structuredClone(defaultPreferences);
			set(defaults);

			// Save to localStorage
			if (browser) {
				try {
					localStorage.setItem('userPreferences', JSON.stringify(defaults));
				} catch (error) {
					console.warn('Failed to save default preferences to localStorage:', error);
				}
			}
		},
		// Get current preferences value (for non-reactive access)
		getCurrent: (): UserPreferences => {
			let current: UserPreferences;
			subscribe((value) => (current = value))();
			return current!;
		},
		// Get default preferences
		getDefaults: () => structuredClone(defaultPreferences),
		// Check if current preferences are different from defaults
		isDifferentFromDefaults: (): boolean => {
			const current = JSON.stringify(getCurrent());
			const defaults = JSON.stringify(defaultPreferences);
			return current !== defaults;
		}
	};

	function getCurrent(): UserPreferences {
		let current: UserPreferences;
		subscribe((value) => (current = value))();
		return current!;
	}
}

export const userPreferences = createPreferencesStore();
