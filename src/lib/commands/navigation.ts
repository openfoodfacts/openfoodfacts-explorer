import type { Command } from './types';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

/**
 * Return navigation commands for routes that exist in the app.
 */
export function getNavigationCommands(): Command[] {
	const cmds: Command[] = [
		{
			id: 'nav-home',
			title: 'Home',
			description: 'Go to the home page',
			category: 'Navigation',
			priority: 10,
			action: () => goto(resolve('/'))
		},
		{
			id: 'nav-search',
			title: 'Search products',
			description: 'Search for a product by name, brand, or barcode',
			keywords: ['search', 'find', 'products', 'query', 'barcode', 'lookup'],
			category: 'Navigation',
			priority: 9,
			requiresInput: true,
			inputPlaceholder: 'Type your search query...',
			action: (input?: string) => {
				const value = input?.trim();
				if (!value) return;
				void goto(resolve('/search') + '?q=' + encodeURIComponent(value));
			}
		},
		{
			id: 'nav-explore',
			title: 'Explore',
			description: 'Open the explore page',
			category: 'Navigation',
			action: () => goto(resolve('/explore'))
		},
		{
			id: 'nav-facets',
			title: 'Facets',
			description: 'Browse facets',
			category: 'Navigation',
			action: () => goto(resolve('/facets'))
		},
		{
			id: 'nav-settings',
			title: 'Settings',
			description: 'Open settings',
			category: 'Navigation',
			action: () => goto(resolve('/settings'))
		},
		{
			id: 'nav-qr',
			title: 'Scan QR',
			description: 'Open QR scanner',
			category: 'Navigation',
			action: () => goto(resolve('/qr'))
		}
	];

	return cmds;
}
