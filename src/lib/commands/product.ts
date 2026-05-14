import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { browser } from '$app/environment';
import { copyTextToClipboard } from '$lib/utils/clipboard';
import { shareContent } from '$lib/utils/webShare';
import type { Command, CommandProvider } from './types';
import type { ProductContext } from './types';

export const productCommands: CommandProvider<ProductContext> = (context) => {
	const commands: Command[] = [
		{
			id: 'open-product-by-barcode',
			title: 'Open Product by Barcode',
			description: 'Search for a product by its barcode',
			keywords: ['barcode', 'scan', 'product', 'lookup', 'code'],
			category: 'Product',
			priority: 30,
			action: () => {
				if (browser) {
					const barcode = prompt('Enter product barcode:');
					const trimmedBarcode = barcode?.trim();
					if (trimmedBarcode) {
						goto(resolve('/products/[barcode]', { barcode: trimmedBarcode }));
					}
				}
			}
		}
	];

	// Add contextual commands if on a product page
	if (context?.barcode) {
		commands.push(
			{
				id: 'edit-product',
				title: 'Edit This Product',
				description: `Edit ${context.productName || 'this product'}`,
				keywords: ['edit', 'modify', 'update', 'change'],
				shortcut: ['E'],
				category: 'Product',
				contextual: true,
				priority: 200,
				action: () => {
					goto(resolve('/products/[barcode]/edit', { barcode: context.barcode! }));
				}
			},
			{
				id: 'share-product',
				title: 'Share This Product',
				description: `Share ${context.productName || 'this product'}`,
				keywords: ['share', 'copy', 'link', 'url'],
				category: 'Product',
				contextual: true,
				priority: 190,
				action: async () => {
					if (browser) {
						await shareContent(
							{
								url: window.location.href,
								title: context.productName || 'Open Food Facts product',
								text: context.productName
							},
							{
								onSuccess: () => context.notify?.success('Product shared'),
								onClipboard: () => context.notify?.success('Product link copied'),
								onError: () => context.notify?.error('Could not share this product')
							}
						);
					}
				}
			},
			{
				id: 'copy-barcode',
				title: 'Copy Barcode',
				description: `Copy barcode: ${context.barcode}`,
				keywords: ['copy', 'barcode', 'code'],
				shortcut: ['Shift', 'B'],
				category: 'Product',
				contextual: true,
				priority: 180,
				action: async () => {
					const copied = await copyTextToClipboard(context.barcode!);
					if (copied) {
						context.notify?.success('Barcode copied');
					} else {
						context.notify?.error('Could not copy barcode');
					}
				}
			},
			{
				id: 'open-product-details',
				title: 'Open Product Details',
				description: 'Open the main product details page',
				keywords: ['details', 'product', 'overview', 'page'],
				category: 'Product',
				contextual: true,
				priority: 170,
				action: () => {
					goto(resolve('/products/[barcode]', { barcode: context.barcode! }));
				}
			}
		);
	}

	return commands;
};
