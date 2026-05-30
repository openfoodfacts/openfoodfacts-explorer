import type { Command } from './types';
import { browser } from '$app/environment';
import { clearAppCache } from '$lib/utils/cache';

/**
 * Returns utility commands (reload, clear cache).
 */
export function getUtilityCommands(): Command[] {
	const cmds: Command[] = [
		{
			id: 'util-reload',
			title: 'Reload app',
			description: 'Reload the application',
			category: 'Utility',
			action: () => {
				if (!browser) return;
				window.location.reload();
			}
		},
		{
			id: 'util-clear-cache',
			title: 'Clear app cache',
			description: 'Clear localStorage and service worker caches and reload',
			category: 'Utility',
			action: async () => {
				if (!browser) return;
				await clearAppCache();
				window.location.reload();
			}
		}
	];

	return cmds;
}
