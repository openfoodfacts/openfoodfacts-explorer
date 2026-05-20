import Fuse from 'fuse.js';
import type { Command } from '$lib/commands/types';

let cachedFuse: Fuse<Command> | null = null;
let cachedCommands: Command[] | null = null;

/**
 * Perform a fuzzy search over commands using Fuse.js.
 * The Fuse instance is cached and rebuilt only when the commands array changes.
 * Title weight: 0.6, keywords: 0.3, description: 0.1
 */
export function fuzzySearch(commands: Command[], query: string): Command[] {
	const q = query.trim();
	if (!q) return commands;

	if (commands !== cachedCommands || cachedFuse === null) {
		cachedFuse = new Fuse(commands, {
			keys: [
				{ name: 'title', weight: 0.6 },
				{ name: 'keywords', weight: 0.3 },
				{ name: 'description', weight: 0.1 }
			],
			threshold: 0.4,
			ignoreLocation: true,
			includeScore: true
		});
		cachedCommands = commands;
	}

	return cachedFuse.search(q).map((result) => result.item);
}
