import type { FacetSortOption, FacetValueResponse } from '@openfoodfacts/openfoodfacts-nodejs';
import { QUERY_FACETS } from './query-facets';
import { createQueryProductApi } from './query-product-api';

const QUERY_SORT_FIELDS: Record<FacetSortOption, string> = {
	popularity: 'popularity_key',
	nutriscore_score: 'nutriscore_score_opposite',
	environmental_score_score: 'environmental_score_score',
	created_t: 'created_t',
	last_modified_t: 'last_modified_t'
};

export async function queryFacetProducts(
	fetch: typeof globalThis.fetch,
	queryUrl: string,
	facet: string,
	value: string,
	opts: { page: number; pageSize: number; sortBy?: FacetSortOption }
): Promise<FacetValueResponse | null> {
	const field = Object.hasOwn(QUERY_FACETS, facet) ? QUERY_FACETS[facet] : undefined;
	if (!queryUrl || !field) return null;

	const filter = { [field]: value };
	const sortField = QUERY_SORT_FIELDS[opts.sortBy ?? 'last_modified_t'];

	const api = createQueryProductApi(fetch, queryUrl);
	const productsPromise = api.POST('/find', {
		body: {
			filter,
			projection: Object.fromEntries(
				[
					'code',
					'product_name',
					'brands',
					'quantity',
					'nutriscore_grade',
					'ecoscore_grade',
					'green_score_grade',
					'environmental_score_grade',
					'nova_group',
					'product_type',
					'nutriments',
					'additives_n',
					'origins_tags',
					'countries_tags'
				].map((field) => [field, true])
			),
			sort: [[sortField, -1]],
			limit: opts.pageSize,
			skip: (opts.page - 1) * opts.pageSize
		}
	});

	const countPromise = api.POST('/count', { body: filter });
	const [productsResponse, countResponse] = await Promise.all([productsPromise, countPromise]);
	if (!productsResponse.response.ok) {
		throw new Error(`Query find failed: ${productsResponse.response.status}`);
	} else if (!countResponse.response.ok) {
		throw new Error(`Query count failed: ${countResponse.response.status}`);
	}

	const rawProducts = productsResponse.data;
	const count = countResponse.data;
	if (!Array.isArray(rawProducts) || typeof count !== 'number') {
		throw new Error('Invalid Query response');
	}

	return {
		// Query returns the projected card fields rather than the SDK's full Product type.
		products: rawProducts as FacetValueResponse['products'],
		count,
		page: opts.page,
		page_size: opts.pageSize,
		page_count: rawProducts.length
	};
}
