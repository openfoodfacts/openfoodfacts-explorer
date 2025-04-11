import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ url }) => {
	const barcode = url.searchParams.get('barcode');

	if (!barcode) {
		error(401, { message: 'Barcode required to access this page' });
	}

	const preferences = typeof window !== 'undefined' ? localStorage.getItem('preferences') : null;
	const parsedPreferences = preferences ? JSON.parse(preferences) : null;

	const user_id = parsedPreferences?.username ?? null;
	const password = parsedPreferences?.password ?? null;

	return {
		barcode,
		user: {
			user_id,
			password
		}
	};
};
