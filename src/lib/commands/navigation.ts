import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { CommandProvider } from './types';

/**
 * Navigation command provider
 * Provides commands for navigating to different pages
 */
export const navigationCommands: CommandProvider = () => [
	{
		id: 'go-home',
		title: 'Go Home',
		description: 'Navigate to the homepage',
		keywords: ['home', 'start', 'dashboard', 'main', 'landing'],
		shortcut: ['G', 'H'],
		category: 'Navigation',
		priority: 100,
		action: () => goto('/')
	},
	{
		id: 'go-to-search',
		title: 'Search Products',
		description: 'Open the product search page',
		keywords: ['search', 'find', 'products', 'query', 'lookup', 'barcode'],
		shortcut: ['/'],
		category: 'Navigation',
		priority: 90,
		action: () => goto('/search')
	},
	{
		id: 'go-to-products',
		title: 'Explore Products',
		description: 'Browse product highlights and discovery pages',
		keywords: ['products', 'product page', 'explore', 'browse', 'food', 'catalog'],
		category: 'Navigation',
		priority: 85,
		action: () => goto(resolve('/explore'))
	},
	{
		id: 'go-to-settings',
		title: 'Settings',
		description: 'Manage preferences and app settings',
		keywords: ['settings', 'preferences', 'language', 'country', 'account', 'theme'],
		category: 'Navigation',
		priority: 80,
		action: () => goto(resolve('/settings'))
	},
	{
		id: 'go-to-about',
		title: 'About',
		description: 'Learn about Open Food Facts',
		keywords: ['about', 'info', 'information', 'help'],
		category: 'Navigation',
		priority: 70,
		action: () => goto(resolve('/static/discover'))
	},
	{
		id: 'go-to-contribute',
		title: 'Contribute',
		description: 'Learn how to contribute to Open Food Facts',
		keywords: ['contribute', 'add product', 'edit', 'help', 'community'],
		category: 'Navigation',
		priority: 65,
		action: () => goto(resolve('/static/[id]', { id: 'contribute' }))
	},
	{
		id: 'go-to-license',
		title: 'License',
		description: 'Open the Open Food Facts data and license page',
		keywords: ['license', 'licence', 'data', 'open data', 'terms', 'legal'],
		category: 'Navigation',
		priority: 60,
		action: () => goto(resolve('/static/[id]', { id: 'data' }))
	}
];
