import { type Country, type Language } from '@openfoodfacts/openfoodfacts-nodejs';

import { createProductsApi, getTaxo } from '$lib/api';
import { createPricesApi } from '$lib/api/prices';

import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	const languages = await getTaxo<Language>('languages', fetch);
	let countries = await getTaxo<Country>('countries', fetch);

	// Not every country has a language_code_2, so we need to filter them out
	// as they are used to store the language preference and to query the API
	// TODO: fix the taxonomy to add missing codes
	countries = Object.fromEntries(
		Object.entries(countries).filter(([, country]) => country.country_code_2 != null)
	);

	const off = createProductsApi(fetch);
	const pricesApi = createPricesApi(fetch);

	const attributeGroups = off.getAttributeGroups();
	const currencies = pricesApi.getCurrenciesList();

	return {
		languages,
		countries,

		currencies: await currencies,
		attributeGroups: (await attributeGroups).data
	};
};
