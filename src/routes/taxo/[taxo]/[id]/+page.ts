import { get } from 'svelte/store';
import { error } from '@sveltejs/kit';

import type { ProductReduced, ProductSearch, Taxonomy } from '$lib/api';
import { preferences } from '$lib/settings';
import { SEARCH_URL, TAXONOMY_URL } from '$lib/const';

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

export const load: PageLoad = async ({ params, fetch }) => {
	const { id, taxo: taxonomyName } = params;

	const taxonomy = (await (await fetch(TAXONOMY_URL(taxonomyName))).json()) as Taxonomy;
	const element = taxonomy[id];

	if (element == null) error(404, 'Taxonomy element not found');

	const search = getProducts(taxonomyName, id, fetch);

	return {
		taxonomy: taxonomyName,
		taxonomyElement: element,
		fullTaxonomy: taxonomy,
		streamed: {
			search
		}
	};
};
