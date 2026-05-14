import type { Command, CommandActionContext, ProductContext } from './types';
import { navigationCommands } from './navigation';
import { utilityCommands } from './utility';
import { productCommands } from './product';
import { searchCommands as searchCommandList } from '$lib/utils/fuzzySearch';

export type { Command, CommandCategory, ProductContext } from './types';

const categoryOrder = { Navigation: 1, Product: 2, Utility: 3, Miscellaneous: 4 };

/**
 * Build a fresh registry from providers.
 *
 * The command list is intentionally derived from current context instead of
 * mutating a singleton, so route-specific commands disappear automatically
 * when the SvelteKit page state changes.
 */
export function createCommandRegistry(
	context: CommandActionContext & ProductContext = {}
): Command[] {
	const commands = [
		...navigationCommands(context),
		...productCommands(context),
		...utilityCommands(context)
	];

	return sortCommands(commands);
}

export function sortCommands(commands: Command[]): Command[] {
	return [...commands].sort((a, b) => {
		if (a.contextual !== b.contextual) return a.contextual ? -1 : 1;

		const priorityDiff = (b.priority ?? 0) - (a.priority ?? 0);
		if (priorityDiff !== 0) return priorityDiff;

		const categoryA = a.category ?? 'Miscellaneous';
		const categoryB = b.category ?? 'Miscellaneous';
		const categoryDiff = categoryOrder[categoryA] - categoryOrder[categoryB];
		if (categoryDiff !== 0) return categoryDiff;

		return a.title.localeCompare(b.title);
	});
}

export function searchCommands(commands: Command[], query: string): Command[] {
	return sortCommands(searchCommandList(commands, query));
}
