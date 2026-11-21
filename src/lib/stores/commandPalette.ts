import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import type { Command } from '$lib/commands/types';

/**
 * Controls whether the command palette is open.
 */
export const commandPaletteOpen: Writable<boolean> = writable(false);

export type CommandContext = {
	/** Return all currently registered commands (merged). */
	getCommands: () => Command[];
	/** Register a set of commands under a stable source id. */
	register: (sourceId: string, commands: Command[]) => void;
	/** Unregister all commands for a given source id. */
	unregister: (sourceId: string) => void;
};

export function setCommandCtx(ctx: () => CommandContext) {
	setContext('command-ctx', ctx);
}

export function getCommandCtx(): CommandContext {
	const lambda = getContext('command-ctx') as () => CommandContext;
	if (!lambda) throw new Error('Command context not found');
	return lambda();
}
