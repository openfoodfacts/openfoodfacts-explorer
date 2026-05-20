import type { Command } from './types';
import { getNavigationCommands } from './navigation';
import { getProductCommands } from './product';
import { getUtilityCommands } from './utility';
import { fuzzySearch } from '$lib/utils/fuzzySearch';
import { getProductContextFromRoute } from '$lib/utils/routes';

/**
 * Create the merged command registry for a given pathname.
 * Calls navigation -> product -> utility providers in that order.
 */
export function createCommandRegistry({ pathname }: { pathname: string }): Command[] {
	const nav = getNavigationCommands();
	const productContext = getProductContextFromRoute(pathname);
	const product = getProductCommands(productContext ? productContext.barcode : null);
	const util = getUtilityCommands();

	return [...nav, ...product, ...util];
}

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

/**
 * Search commands with optional fuzzy search.
 * When query is empty or whitespace, returns sortCommands(commands).
 * When query has content, returns fuzzySearch(commands, query) directly (preserves relevance ordering).
 */
export function searchCommands(commands: Command[], query: string): Command[] {
	const q = query.trim();
	if (!q) return sortCommands(commands);
	return fuzzySearch(commands, q);
}
