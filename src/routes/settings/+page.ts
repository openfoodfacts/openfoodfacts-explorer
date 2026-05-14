import { type Country, type Language } from '@openfoodfacts/openfoodfacts-nodejs';

import { createProductsApi, getTaxo } from '$lib/api';
import { createPricesApi } from '$lib/api/prices';
import type { Taxonomy } from '$lib/api';

import type { PageLoad } from './$types';

export const ssr = false;

const fallbackLanguages: Taxonomy<Language> = {
	en: {
		name: {
			en: 'English'
		},
		language_code_2: {
			en: 'en'
		},
		language_code_3: {
			en: 'eng'
		}
	}
};

const fallbackCountries: Taxonomy<Country> = {};

async function withSettingsFallback<T>(
	label: string,
	promise: Promise<T>,
	fallback: T
): Promise<T> {
	try {
		return await promise;
	} catch (error) {
		console.error(`Failed to load settings ${label}:`, error);
		return fallback;
	}
}

export const load: PageLoad = async ({ fetch }) => {
	const [languages, countriesRaw] = await Promise.all([
		withSettingsFallback('languages', getTaxo<Language>('languages', fetch), fallbackLanguages),
		withSettingsFallback('countries', getTaxo<Country>('countries', fetch), fallbackCountries)
	]);

	// Not every country has a language_code_2, so we need to filter them out
	// as they are used to store the language preference and to query the API
	// TODO: fix the taxonomy to add missing codes
	const countries = Object.fromEntries(
		Object.entries(countriesRaw).filter(([, country]) => country.country_code_2 != null)
	);

	const off = createProductsApi(fetch);
	const pricesApi = createPricesApi(fetch);

	// TODO: Replace with SDK call when available (API v3.4)
	const { data: attributeGroupsRaw } = await withSettingsFallback(
		'attribute groups',
		off.apiv3.client.GET('/api/v3.4/attribute_groups'),
		{ data: { attribute_groups: [] }, response: new Response() }
	);
	const attributeGroups = attributeGroupsRaw?.attribute_groups ?? [];

	const currencies = withSettingsFallback('currencies', pricesApi.getCurrenciesList(), ['USD']);

	return {
		languages,
		countries,

		currencies: await currencies,
		attributeGroups: attributeGroups
	};
};
