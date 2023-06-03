import { get } from 'svelte/store';
import { PRODUCT_URL, TAXONOMY_URL } from './const';
import type { ProductReduced, ProductState } from './product';
import { preferences } from './settings';
import type { TaxoNode, Taxonomy } from './taxo';

export async function getTaxo<T extends TaxoNode>(
	taxo: string,
	fetch: (url: string) => Promise<Response>
): Promise<Taxonomy<T>> {
	const res = await fetch(TAXONOMY_URL(taxo));
	return await res.json();
}

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

export type ProductTag = {
	product: string;
	k: string;
	v: string;

	owner?: string;
	version?: number;
	editor?: string;
	last_edit?: string;
	comment?: string;
};

export type Key = {
	k: string;
	count: number;
	values: number;
};

export async function loginFolksonomy(username: string, password: string) {
	const res = await fetch('https://api.folksonomy.openfoodfacts.org/auth', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			username,
			password
		}).toString()
	});
	if (res.status !== 200) throw new Error('Could not authenticate to Folksonomy API');

	const token = (await res.json()) as { access_token: string; token_type: string };
	preferences.update((p) => ({
		...p,
		folksonomy: {
			...p.folksonomy,
			authToken: token.access_token
		}
	}));
}

export async function getProductFolksonomy(
	barcode: string,
	fetch: (url: string, options?: RequestInit) => Promise<Response>
): Promise<ProductTag[] | null> {
	const res = await fetch('https://api.folksonomy.openfoodfacts.org/product/' + barcode);
	return await res.json();
}

export async function getKeys(
	fetch: (url: string, options?: RequestInit) => Promise<Response>
): Promise<Key[]> {
	const res = await fetch('https://api.folksonomy.openfoodfacts.org/keys');
	return await res.json();
}

export async function putProductTag(
	tag: ProductTag,
	fetch: (url: string, options?: RequestInit) => Promise<Response>
): Promise<boolean> {
	const res = await fetch('https://api.folksonomy.openfoodfacts.org/product', {
		method: 'PUT',
		body: JSON.stringify(tag),
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + get(preferences).folksonomy.authToken
		}
	});

	return res.status === 200;
}

export async function createProductTag(
	tag: ProductTag,
	fetch: (url: string, options?: RequestInit) => Promise<Response>
): Promise<boolean> {
	const res = await fetch('https://api.folksonomy.openfoodfacts.org/product', {
		method: 'POST',
		body: JSON.stringify(tag),
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + get(preferences).folksonomy.authToken
		}
	});

	return res.status === 200;
}

export async function deleteProductTag(
	tag: ProductTag,
	fetch: (url: string, options?: RequestInit) => Promise<Response>
) {
	const res = await fetch(
		'https://api.folksonomy.openfoodfacts.org/product/' +
			tag.product +
			'/' +
			tag.k +
			'?version=' +
			tag.version,
		{
			method: 'DELETE',
			body: JSON.stringify(tag),
			headers: {
				Authorization: 'Bearer ' + get(preferences).folksonomy.authToken
			}
		}
	);

	return res.json();
}
