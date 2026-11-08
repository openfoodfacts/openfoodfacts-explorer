import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { resolveForUrl } from '#lib/paths.js';

export const load: PageLoad = async ({ params, url }) => {
	const { barcode } = params;

	redirect(302, resolveForUrl(url, '/products/[barcode]', { barcode }));
};
