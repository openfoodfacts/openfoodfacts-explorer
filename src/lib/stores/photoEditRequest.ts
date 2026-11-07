import { writable } from 'svelte/store';

export type PhotoEditRequest = {
	// Photo type id, e.g. `ingredients`
	typeId: string;
	language: string;
	// Element to bring back into view and focus once the editor is closed
	returnTo?: HTMLElement;
};

/**
 * Lets an edit step ask the photo manager to open its editor for the selected
 * image of a given type and language, without going through the Photos section.
 */
export const photoEditRequest = writable<PhotoEditRequest | null>(null);
