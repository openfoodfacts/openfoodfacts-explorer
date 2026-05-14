import { writable } from 'svelte/store';

export const commandPaletteOpen = writable(false);

export function openCommandPalette() {
	commandPaletteOpen.set(true);
}

export function closeCommandPalette() {
	commandPaletteOpen.set(false);
}

export function toggleCommandPalette() {
	commandPaletteOpen.update((open) => !open);
}
