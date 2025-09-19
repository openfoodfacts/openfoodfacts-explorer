import { createProductsApi, getTaxo } from '$lib/api';
import { type Country, type Language } from '@openfoodfacts/openfoodfacts-nodejs';
import type { PageLoad } from './$types';
import { createPricesApi } from '$lib/api/prices';
import { wrapFetchWithCredentials } from '$lib/api/utils';
import { API_HOST } from '$lib/const';
import { dev } from '$app/environment';

export const ssr = false;

async function getUserLogin(fetch: typeof window.fetch) {
	const { fetch: authenticatedFetch, url } = wrapFetchWithCredentials(fetch, new URL(API_HOST));

	// TODO: replace this with SDK
	try {
		const response = await authenticatedFetch(`${url}cgi/auth.pl?body=1`);
		if (!response.ok) {
			return null;
		}

		return (await response.json()) as {
			status: 1 | 0;
			status_verbose: string;
			user: {
				admin: 0 | 1;
				moderator: 1 | 0;
				name: string;
			};
			user_id: string;
		};
	} catch {
		console.warn('Could not reach the API, using dummy user in dev mode');
		if (dev) {
			return {
				status: 0,
				status_verbose: 'DEVELOPMENT',
				user: { admin: 1, moderator: 1, name: 'Developer (dev mode)' },
				user_id: 'developer'
			};
		} else {
			return null;
		}
	}
}

export const load: PageLoad = async ({ fetch }) => {
	const languages = await getTaxo<Language>('languages', fetch);
	let countries = await getTaxo<Country>('countries', fetch);

	// FIX: not every country has a language_code_2, so we need to filter them out
	// as they are used to store the language preference and to query the API
	countries = Object.fromEntries(
		Object.entries(countries).filter(([, country]) => country.country_code_2 != null)
	);

	const off = createProductsApi(fetch);
	const pricesApi = createPricesApi(fetch);

	const attributeGroups = off.getAttributeGroups();
	const currencies = pricesApi.getCurrenciesList();

	const user = getUserLogin(fetch);

	return {
		languages,
		countries,

		currencies: await currencies,
		attributeGroups: (await attributeGroups).data,

		loginStatus: await user
	};
};
