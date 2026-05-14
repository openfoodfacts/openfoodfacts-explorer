import { browser } from '$app/environment';
import { clearAppCache } from '$lib/utils/cache';
import type { CommandProvider } from './types';

/**
 * Utility command provider
 * Provides commands for utility functions like reload, cache clearing, etc.
 */
export const utilityCommands: CommandProvider = (context) => [
	{
		id: 'reload-page',
		title: 'Reload Page',
		description: 'Reload the current page',
		keywords: ['refresh', 'retry', 'update', 'reload', 're-run'],
		shortcut: ['Ctrl', 'R'],
		category: 'Utility',
		priority: 60,
		action: () => {
			if (browser) {
				window.location.reload();
			}
		}
	},
	{
		id: 'toggle-dark-mode',
		title: 'Toggle Dark/Light Mode',
		description: 'Switch between dark and light theme',
		keywords: ['theme', 'dark', 'light', 'mode', 'toggle'],
		category: 'Utility',
		priority: 50,
		action: () => {
			if (browser) {
				const html = document.documentElement;
				const currentTheme = html.getAttribute('data-theme');
				const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
				html.setAttribute('data-theme', newTheme);
				localStorage.setItem('theme', newTheme);
				context?.notify?.success(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`);
			}
		}
	},
	{
		id: 'clear-cache',
		title: 'Clear Cache',
		description: 'Clear temporary app cache without signing you out',
		keywords: ['cache', 'clear', 'reset', 'storage', 'data', 'temporary'],
		category: 'Utility',
		priority: 40,
		action: async () => {
			const result = await clearAppCache();
			context?.notify?.success(
				result.clearedCount > 0
					? `Cleared ${result.clearedCount} cache item${result.clearedCount === 1 ? '' : 's'}`
					: 'No temporary cache items to clear'
			);
		}
	}
];
