import { writable } from 'svelte/store';

export interface SearchFiltersState {
	nutriscore: string;
	ecoscore: string;
	country: string;
	category: string;
}

export const defaultFilters: SearchFiltersState = {
	nutriscore: '',
	ecoscore: '',
	country: '',
	category: ''
};

export const searchFilters = writable<SearchFiltersState>({ ...defaultFilters });

/**
 * Resets all filter values back to empty strings.
 */
export function resetFilters(): void {
	searchFilters.set({ ...defaultFilters });
}
