import { getTaxo } from '$lib/api';
import type { Country, Language } from '@openfoodfacts/openfoodfacts-nodejs';
import type { PageLoad } from './$types';
import { createPricesApi } from '$lib/api/prices';

export const load = (async ({ fetch }) => {
	const languages = await getTaxo<Language>('languages', fetch);
	let countries = await getTaxo<Country>('countries', fetch);

	// FIX: not every country has a language_code_2, so we need to filter them out
	// as they are used to store the language preference and to query the API
	countries = Object.fromEntries(
		Object.entries(countries).filter(([, country]) => country.country_code_2 != null)
	);

	const pricesApi = createPricesApi(fetch);
	const currencies = await pricesApi.getCurrenciesList();
	return {
		languages,
		countries,
		currencies
	};
}) satisfies PageLoad;
