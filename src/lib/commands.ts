import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { fuzzySearch } from '$lib/utils/fuzzySearch';

type AppRoute = '/' | '/search' | '/settings';

export type CommandCategory = 'Navigation' | 'Actions' | 'Utility';

export type Command = {
	id: string;
	title: string;
	description: string;
	keywords?: string[];
	shortcut?: string[];
	category?: CommandCategory;
	action: () => void | Promise<void>;
};

async function navigateTo(path: AppRoute) {
	await goto(resolve(path));
}

export const commandRegistry: Command[] = [
	{
		id: 'go-home',
		title: 'Go Home',
		description: 'Navigate to the homepage.',
		keywords: ['home', 'start', 'dashboard', 'main', 'landing'],
		category: 'Navigation',
		action: () => navigateTo('/')
	},
	{
		id: 'go-to-search',
		title: 'Search Products',
		description: 'Open the product search page.',
		keywords: ['search', 'find', 'products', 'query', 'lookup', 'barcode'],
		shortcut: ['/'],
		category: 'Navigation',
		action: () => navigateTo('/search')
	},
	{
		id: 'go-to-settings',
		title: 'Open Settings',
		description: 'Manage preferences and app settings.',
		keywords: ['settings', 'preferences', 'language', 'country', 'account', 'theme'],
		category: 'Navigation',
		action: () => navigateTo('/settings')
	},
	{
		id: 'clear-search',
		title: 'Clear Search',
		description: 'Return to the search page with an empty query.',
		keywords: ['clear', 'reset', 'remove query', 'empty search', 'start over'],
		category: 'Actions',
		action: () => navigateTo('/search')
	},
	{
		id: 'reload-page',
		title: 'Reload Page',
		description: 'Reload the current page.',
		keywords: ['refresh', 'retry', 'update', 'reload', 're-run'],
		shortcut: ['Ctrl', 'R'],
		category: 'Utility',
		action: () => {
			if (browser) {
				window.location.reload();
			}
		}
	}
];

export function searchCommands(commands: Command[], query: string): Command[] {
	return fuzzySearch(commands, query, ['title', 'description', 'keywords', 'category', 'shortcut']);
}
