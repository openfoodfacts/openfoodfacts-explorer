import type { PageLoad } from './$types';
import type { Category, Taxo } from '$lib/taxo';
import { preferences } from '$lib/settings';
import { get } from 'svelte/store';
import type { ProductSearch } from '$lib/product';

export const ssr = false;

export const load = (async ({ params, fetch }) => {
	const { id, taxo: taxonomyName } = params;

	const taxoRes = await fetch(
		'https://static.openfoodfacts.org/data/taxonomies/' + taxonomyName + '.json'
	);
	const taxonomy = (await taxoRes.json()) as Record<string, Category>;
	const element = taxonomy[id] as Taxo;

	const search = fetch(
		`https://world.openfoodfacts.org/api/v2/search?${taxonomyName}_tags=${id}&lc=${
			get(preferences).lang
		}`
	).then((res) => res.json()) as Promise<ProductSearch>;

	return {
		taxonomy: taxonomyName,
		taxonomyElement: element,
		fullTaxonomy: taxonomy,
		streamed: {
			search
		}
	};
}) satisfies PageLoad;
