import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	try {
		const parentData = await parent() as { barcode?: string; logos?: unknown[]; logoCount?: number };
		return {
			barcode: parentData.barcode,
			logos: parentData.logos ?? [],
			logoCount: parentData.logoCount ?? 0
		};
	} catch (error) {
		console.error('Error in Loading logos page:', error);

		return {
			barcode: '',
			logos: [],
			logoCount: 0,
			error: 'Failed to load logos'
		};
	}
};