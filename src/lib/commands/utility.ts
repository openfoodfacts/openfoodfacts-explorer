import type { Command } from './types';
import { browser } from '$app/environment';

/**
 * Returns utility commands.
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
		}
	];

	return cmds;
}
