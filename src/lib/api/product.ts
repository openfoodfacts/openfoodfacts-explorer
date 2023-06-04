import { API_HOST, PRODUCT_URL, STATIC_HOST } from '$lib/const';
import { get } from 'svelte/store';
import type { KnowledgePanel } from './knowledgepanels';
import type { Nutriments } from './nutriments';
import { preferences } from '$lib/settings';

export type ProductState<T = Product> = {
	status: 'success' | 'success_with_warnings' | 'success_with_errors' | 'failure';
	result: {
		id: string;
		name: string;
		lc_name: string;
	};
	errors: object[];
	warnings: object[];

	product: T;
};

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

export type ProductReduced = Pick<Product, 'image_front_small_url' | 'code' | 'product_name'>;
export async function getProduct(
	barcode: string,
	fetch: (url: string) => Promise<Response>
): Promise<ProductState> {
	const url =
		PRODUCT_URL(barcode) +
		'?' +
		new URLSearchParams({
			fields: 'all,knowledge_panels',
			lc: get(preferences).lang
		});
	const res = await fetch(url);
	return await res.json();
}

export async function getProductReducedForCard(
	barcode: string,
	fetch: (url: string) => Promise<Response>
): Promise<ProductReduced> {
	const url =
		PRODUCT_URL(barcode) +
		'?' +
		new URLSearchParams({
			fields: 'image_front_small_url,code,product_name',
			lc: get(preferences).lang
		});
	const res = await fetch(url);
	const productState = (await res.json()) as ProductState<ProductReduced>;

	return productState.product;
}

export async function addOrEditProductV2(
	product: Product,
	fetch: (url: string, init: RequestInit) => Promise<Response>
) {
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

	const res = await fetch(url, {
		method: 'POST',
		body,
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	});

	return res.status === 200;
}

function formData(data: Record<string, string | Blob>) {
	const form = new FormData();
	for (const [key, value] of Object.entries(data)) {
		form.append(key, value);
	}
	return form;
}
