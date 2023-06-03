import type { PageLoad } from './$types';
import type { Taxonomy } from '$lib/taxo';
import { preferences } from '$lib/settings';
import { get } from 'svelte/store';
import type { ProductReduced, ProductSearch } from '$lib/product';
import { SEARCH_URL, TAXONOMY_URL } from '$lib/const';
import { error } from '@sveltejs/kit';

export const ssr = false;

async function getProducts(
	taxonomy: string,
	nodeId: string,
	fetch: (url: string) => Promise<Response>
): Promise<ProductSearch<ProductReduced>> {
	const url = `${SEARCH_URL}?${taxonomy}_tags=${nodeId}&lc=${get(preferences).lang}&fields=product_name,code,image_front_small_url`;
	const res = await fetch(url);
	return await res.json();
}

export const load = (async ({ params, fetch }) => {
	const { id, taxo: taxonomyName } = params;

	const taxonomy = (await (await fetch(TAXONOMY_URL(taxonomyName))).json()) as Taxonomy;
	const element = taxonomy[id];

	if (element == null) throw error(404, 'Taxonomy element not found');

	const search = getProducts(taxonomyName, id, fetch);

	return {
		taxonomy: taxonomyName,
		taxonomyElement: element,
		fullTaxonomy: taxonomy,
		streamed: {
			search
		}
	};
}) satisfies PageLoad;
