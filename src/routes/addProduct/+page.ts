import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ url }) => {
    const barcode = url.searchParams.get('barcode');
    console.log('barcode', barcode);

    if (!barcode) {
        // alert('Barcode required to access this page');
        throw redirect(302, '/?error=barcode required to access this page');
    }

    const preferences = typeof window !== 'undefined' ? localStorage.getItem('preferences') : null;
    const parsedPreferences = preferences ? JSON.parse(preferences) : null;

    const user_id = parsedPreferences?.username ?? null;
    const password = parsedPreferences?.password ?? null;

    // if (!user_id || !password) {
    //     // alert('You must be logged in to access this page');
    //     throw redirect(302, '/settings?error=you must be logged in to access this page');
    // }

    return {
        barcode,
        user: {
            user_id,
            password
        }
    };
};