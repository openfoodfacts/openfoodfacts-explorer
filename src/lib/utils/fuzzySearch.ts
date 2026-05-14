import Fuse from 'fuse.js';
import type { Command } from '$lib/commands/types';

export function fuzzySearch<T extends Record<string, unknown>>(
	items: T[],
	query: string,
	keys: string[]
): T[] {
	const normalizedQuery = query.trim();
	if (normalizedQuery === '') return items;

	// Fuse expects stable inputs; make sure we don't re-order by score for empty query.
	const fuse = new Fuse(items, {
		keys,
		threshold: 0.45,
		ignoreLocation: true,
		includeScore: true,
		minMatchCharLength: 1,
		useExtendedSearch: true,
		findAllMatches: false,
		// Slightly more forgiving for short queries.
		shouldSort: true
	});

	return fuse.search(normalizedQuery).map((result) => result.item);
}

function normalize(value: string) {
	return value.trim().toLowerCase();
}

function commandRank(command: Command, query: string, fuseScore: number) {
	const normalizedQuery = normalize(query);
	const title = normalize(command.title);
	const keywords = (command.keywords ?? []).map(normalize);

	let rank = fuseScore * 100;

	if (title === normalizedQuery) rank -= 80;
	else if (title.startsWith(normalizedQuery)) rank -= 45;
	else if (title.includes(normalizedQuery)) rank -= 25;

	if (keywords.some((keyword) => keyword === normalizedQuery)) rank -= 18;
	if (command.contextual) rank -= 15;
	rank -= command.priority ?? 0;
	rank += title.length / 100;

	return rank;
}

export function searchCommands(commands: Command[], query: string): Command[] {
	const normalizedQuery = query.trim();
	if (normalizedQuery === '') return [...commands];

	const fuse = new Fuse(commands, {
		keys: [
			{ name: 'title', weight: 0.7 },
			{ name: 'keywords', weight: 0.2 },
			{ name: 'description', weight: 0.08 },
			{ name: 'category', weight: 0.02 }
		],
		threshold: 0.35,
		distance: 80,
		ignoreLocation: true,
		includeScore: true,
		minMatchCharLength: 1,
		shouldSort: false
	});

	return fuse
		.search(normalizedQuery)
		.sort(
			(a, b) =>
				commandRank(a.item, normalizedQuery, a.score ?? 1) -
				commandRank(b.item, normalizedQuery, b.score ?? 1)
		)
		.map((result) => result.item);
}
