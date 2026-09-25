import type { Command } from './types';

/**
 * Sort commands when there is no active search query.
 * Sorting rules:
 * 1. contextual true first
 * 2. higher priority first
 * 3. category alphabetically
 * 4. title alphabetically
 */
export function sortCommands(commands: Command[]): Command[] {
	return [...commands].sort((a, b) => {
		const aCtx = a.contextual ? 1 : 0;
		const bCtx = b.contextual ? 1 : 0;
		if (aCtx !== bCtx) return bCtx - aCtx;

		const aPr = a.priority ?? 0;
		const bPr = b.priority ?? 0;
		if (aPr !== bPr) return bPr - aPr;

		if (a.category !== b.category) return a.category < b.category ? -1 : 1;

		return a.title < b.title ? -1 : a.title > b.title ? 1 : 0;
	});
}
