import { API_HOST, PRODUCT_URL } from '$lib/const';
import { get } from 'svelte/store';
import type { KnowledgePanel } from './knowledgepanels';
import type { Nutriments } from './nutriments';
import { preferences } from '$lib/settings';

export class ProductsApi {
	private readonly fetch: typeof window.fetch;
	constructor(fetch: typeof window.fetch) {
		this.fetch = fetch;
	}

	async getProduct<T extends Array<keyof Product>>(
		barcode: string,
		{ fields }: { fields: T } = { fields: ['all', 'knowledge_panels'] as T }
	): Promise<ProductState<Pick<Product, T[number]>>> {
		const url =
			PRODUCT_URL(barcode) +
			'?' +
			new URLSearchParams({
				fields: fields.join(','),
				lc: get(preferences).lang
			});
		const res = await this.fetch(url);
		return await res.json();
	}

	async addOrEditProductV2(product: Product) {
		const url = `${API_HOST}/cgi/product_jqm2.pl`;

		const username = get(preferences).username;
		const password = get(preferences).password;

		if (!username || !password) throw new Error('No username or password set');

		const body = formData({
			code: product.code,
			user_id: username,
			password: password,
			categories: product.categories,
			labels: product.labels,
			brands: product.brands
		});

		const res = await this.fetch(url, {
			method: 'POST',
			body,
			headers: { 'Content-Type': 'multipart/form-data' }
		});

		return res.status === 200;
	}

	async getProductReducedForCard(barcode: string): Promise<ProductState<ProductReduced>> {
		const fields = ['product_name', 'code', 'image_front_small_url', 'brands'];

		const params = new URLSearchParams({
			fields: fields.join(','),
			lc: get(preferences).lang
		});

		const res = await this.fetch(`${PRODUCT_URL(barcode)}?${params.toString()}`);
		const productState = (await res.json()) as ProductState<ProductReduced>;

		return productState;
	}

	async getProductName(barcode: string): Promise<Pick<Product, 'product_name'> | null> {
		const params = new URLSearchParams({
			fields: 'product_name',
			lc: get(preferences).lang
		});

		const res = await this.fetch(PRODUCT_URL(barcode) + '?' + params);
		const productState = (await res.json()) as ProductState<Pick<Product, 'product_name'>>;

		if (productState.status !== 'success') return null;
		else return productState.product;
	}
}

/**
 * @deprecated use ProductsApi instead
 */
export async function getProduct(
	barcode: string,
	fetch: typeof window.fetch
): Promise<ProductState> {
	return new ProductsApi(fetch).getProduct(barcode);
}

export type ProductStateBase = {
	result: {
		id: string;
		name: string;
		lc_name: string;
	};
};

export type ProductStateFailure = ProductStateBase & {
	status: 'failure';
	errors: {
		field: { id: string; value: string };
		impact: { lc_name: string; name: string; id: string };
		message: { lc_name: string; name: string; id: string };
	}[];
};

export type ProductStateFound<T = Product> = ProductStateBase & {
	product: T;
};

export type ProductStateSuccess<T = Product> = ProductStateFound<T> & {
	status: 'success';
};

export type ProductStateSuccessWithWarnings<T = Product> = ProductStateFound<T> & {
	status: 'success_with_warnings';
	warnings: object[];
};

export type ProductStateSuccessWithErrors<T = Product> = ProductStateFound<T> & {
	status: 'success_with_errors';
	errors: object[];
};

export type ProductState<T = Product> =
	| ProductStateSuccess<T>
	| ProductStateSuccessWithWarnings<T>
	| ProductStateSuccessWithErrors<T>
	| ProductStateFailure;

export type ProductSearch<T = Product> = {
	count: number;
	page: number;
	page_count: number;
	page_size: number;
	products: T[];
	skip: number;
};

export type Product = {
	knowledge_panels: Record<string, KnowledgePanel>;
	product_name: string;
	product_name_en: string;
	_id: string;
	code: string;
	_keywords: string[];
	additives_n: number;
	ingredients: {
		id: string;
		percent: number;
		percent_estimate: number;
		percent_max: number;
		percent_min: number;
		text: string;
		vegan: string;
		vegetarian: string;
	}[];
	additives_tags: string[];

	image_front_url: string;
	image_front_small_url: string;
	image_front_thumb_url: string;

	image_ingredients_url: string;
	image_ingredients_small_url: string;
	image_ingredients_thumb_url: string;

	image_nutrition_url: string;
	image_nutrition_small_url: string;
	image_nutrition_thumb_url: string;

	quantity: string;
	nutriscore_grade: string;
	ecoscore_grade: string;
	nova_group: number;

	brands: string;
	brands_tags: string[];

	categories: string;
	categories_tags: string[];
	categories_hierarchy: object[];

	stores: string;
	stores_tags: string[];

	labels: string;
	labels_tags: string[];

	nutriments: Nutriments;
};

export type ProductReduced = Pick<
	Product,
	'image_front_small_url' | 'code' | 'product_name' | 'brands'
>;

/** @deprecated */
export async function getProductReducedForCard(
	barcode: string,
	fetch: typeof window.fetch
): Promise<ProductState<ProductReduced>> {
	return new ProductsApi(fetch).getProductReducedForCard(barcode);
}
/** @deprecated */
export async function getProductName(
	fetch: typeof window.fetch,
	barcode: string
): Promise<Pick<Product, 'product_name'> | null> {
	return new ProductsApi(fetch).getProductName(barcode);
}

/** @deprecated */
export async function addOrEditProductV2(product: Product, fetch: typeof window.fetch) {
	return new ProductsApi(fetch).addOrEditProductV2(product);
}

function formData(data: Record<string, string | Blob>) {
	const form = new FormData();
	for (const [key, value] of Object.entries(data)) {
		form.append(key, value);
	}
	return form;
}
