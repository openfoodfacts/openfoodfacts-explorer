import { get } from 'svelte/store';
import { error } from '@sveltejs/kit';
import { OpenFoodFacts, type LocalizedString } from '@openfoodfacts/openfoodfacts-nodejs';

import { type ProductReduced, type ProductSearch } from '$lib/api';
import { preferences } from '$lib/settings';
import { SEARCH_URL } from '$lib/const';

import type { PageLoad } from './$types';

export const ssr = false;

async function getProducts(
	taxonomy: string,
	nodeId: string,
	fetch: (url: string) => Promise<Response>
): Promise<ProductSearch<ProductReduced>> {
	const fields = ['product_name', 'code', 'image_front_small_url'];

	const params = new URLSearchParams({
		[`${taxonomy}_tags`]: nodeId,
		lc: get(preferences).lang,
		fields: fields.join(',')
	});

	const res = await fetch(`${SEARCH_URL}?${params.toString()}`);
	return await res.json();
}

function getWikidataId(element: LocalizedString): string {
	const id = element?.['en'] || element?.['fr'] || element?.['es'] || element?.['it'];
	if (id) {
		return id;
	}
	// get first available language
	return element?.[Object.keys(element)[0]] || '';
}

export type WikidataDetails = {
	description: string | null;
	label: string | null;
};

async function getWikidataDetails(
	fetch: typeof window.fetch,
	id: string
): Promise<WikidataDetails> {
	const params = new URLSearchParams({
		action: 'wbgetentities',
		ids: id,
		props: ['descriptions', 'labels'].join('|'),
		languages: 'en',
		format: 'json',
		origin: '*'
	});
	const res = await fetch(`https://www.wikidata.org/w/api.php?${params.toString()}`);
	const data = (await res.json()) as {
		entities: Record<
			string,
			{
				descriptions: Record<string, { value: string }>;
				labels: Record<string, { value: string }>;
			}
		>;
	};
	const description = data.entities[id]?.descriptions?.['en']?.value ?? null;
	const label = data.entities[id]?.labels?.['en']?.value ?? null;
	return { description, label };
}

export const load: PageLoad = async ({ params, fetch }) => {
	const { id, taxo: taxonomyName } = params;

	const client = new OpenFoodFacts(fetch);
	const taxonomy = await client.getTaxo(taxonomyName);
	const element = taxonomy[id];

	if (element == null) error(404, 'Taxonomy element not found');

	let wikidata: (WikidataDetails & { id: string }) | null = null;
	if (element.wikidata != null) {
		const id = getWikidataId(element.wikidata);
		const wikidataDetails = await getWikidataDetails(fetch, id);

		wikidata = {
			id: id,
			...wikidataDetails
		};
	}

	const search = getProducts(taxonomyName, id, fetch);

	return {
		taxonomyName: taxonomyName,
		taxonomyElement: element,
		taxonomy: taxonomy,
		wikidata: wikidata,
		streamed: { search }
	};
};
