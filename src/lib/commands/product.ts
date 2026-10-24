import type { Command } from './types';
import { copyTextToClipboard } from '$lib/utils/clipboard';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

/**
 * Provide product-specific commands when a barcode is present.
 * @param barcode - product barcode or null
 */
export function getProductCommands(barcode: string | null): Command[] {
	if (!barcode) return [];

	return [
		{
			id: 'product-edit',
			title: 'Edit product',
			description: 'Open the product editor',
			category: 'Product',
			contextual: true,
			priority: 100,
			action: () => {
				if (!browser) return;
				return goto(resolve(`/products/${encodeURIComponent(barcode)}/edit`));
			}
		},
		{
			id: 'product-copy-barcode',
			title: 'Copy barcode',
			description: 'Copy the product barcode to clipboard',
			category: 'Product',
			contextual: true,
			action: async () => {
				await copyTextToClipboard(barcode);
			}
		},
		{
			id: 'product-share',
			title: 'Share product',
			description: 'Share product link or copy URL',
			category: 'Product',
			contextual: true,
			action: async () => {
				if (!browser) return;
				if (navigator.share) {
					try {
						await navigator.share({ title: document.title, url: window.location.href });
						return;
					} catch (error) {
						if (error instanceof Error && error.name === 'AbortError') return;
						// ignore and fall through to copy fallback
					}
				}

				await copyTextToClipboard(window.location.href);
			}
		}
	];
}
