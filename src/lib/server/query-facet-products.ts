import type {
	FacetSortOption,
	FacetValueResponse,
	Product
} from '@openfoodfacts/openfoodfacts-nodejs';
import { QUERY_FACETS } from './query-facets';

type RawProduct = Product & {
	lang?: string;
	lc?: string;
	images?: { selected?: { front?: Record<string, { rev?: string | number }> } };
};

export function frontImageUrl(product: RawProduct, imageHost: string): string | undefined {
	if (!imageHost || !/^\d{1,24}$/.test(product.code)) return undefined;
	const fronts = product.images?.selected?.front;
	if (!fronts) return undefined;
	const language = [product.lc, product.lang, 'en', ...Object.keys(fronts)].find(
		(lang): lang is string =>
			!!lang && /^[a-z]{2}(?:-[a-z]{2})?$/i.test(lang) && !!fronts[lang]?.rev
	);
	if (!language) return undefined;
	const code = product.code.padStart(13, '0');
	const path = `${code.slice(0, 3)}/${code.slice(3, 6)}/${code.slice(6, 9)}/${code.slice(9)}`;
	return `${imageHost.replace(/\/$/, '')}/images/products/${path}/front_${language}.${fronts[language].rev}.200.jpg`;
}

export async function queryFacetProducts(
	fetch: typeof globalThis.fetch,
	queryUrl: string,
	imageHost: string,
	facet: string,
	value: string,
	opts: { page: number; pageSize: number; sortBy?: FacetSortOption }
): Promise<FacetValueResponse | null> {
	const field = Object.hasOwn(QUERY_FACETS, facet) ? QUERY_FACETS[facet] : undefined;
	if (!queryUrl || !field) return null;
	const filter = { [field]: value };
	const sortField =
		opts.sortBy === 'popularity'
			? 'popularity_key'
			: opts.sortBy === 'nutriscore_score'
				? 'nutriscore_score_opposite'
				: (opts.sortBy ?? 'last_modified_t');
	const post = async (endpoint: string, body: unknown) => {
		const response = await fetch(`${queryUrl.replace(/\/$/, '')}/${endpoint}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		if (!response.ok) throw new Error(`Query ${endpoint} failed: ${response.status}`);
		return response.json();
	};
	const [rawProducts, count] = await Promise.all([
		post('find', {
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
					'countries_tags',
					'images',
					'lc',
					'lang'
				].map((field) => [field, true])
			),
			sort: [[sortField, -1]],
			limit: opts.pageSize,
			skip: (opts.page - 1) * opts.pageSize
		}),
		post('count', filter)
	]);
	if (!Array.isArray(rawProducts) || typeof count !== 'number')
		throw new Error('Invalid Query response');
	const products = (rawProducts as RawProduct[]).map((product) => {
		const image = frontImageUrl(product, imageHost);
		return { ...product, ...(image ? { image_front_small_url: image } : {}) };
	});
	return {
		// Query returns the projected card fields rather than the SDK's full Product type.
		products: products as unknown as FacetValueResponse['products'],
		count,
		page: opts.page,
		page_size: opts.pageSize,
		page_count: products.length
	};
}
