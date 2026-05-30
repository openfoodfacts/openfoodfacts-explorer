import { writable } from 'svelte/store';

/**
 * Controls whether the command palette is open.
 */
export const commandPaletteOpen = writable(false);
