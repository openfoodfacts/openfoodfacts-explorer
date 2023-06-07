import { preferences } from '$lib/settings';
import { get } from 'svelte/store';
import type { FolksonomyKey, FolksonomyTag } from './types';
import { wrapFetch } from '$lib/utils';

export async function loginFolksonomy(username: string, password: string) {
	const res = await wrapFetch(fetch)('https://api.folksonomy.openfoodfacts.org/auth', {
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
): Promise<FolksonomyTag[] | null> {
	const res = await wrapFetch(fetch)('https://api.folksonomy.openfoodfacts.org/product/' + barcode);
	return await res.json();
}

export async function getKeys(
	fetch: (url: string, options?: RequestInit) => Promise<Response>
): Promise<FolksonomyKey[]> {
	const res = await fetch('https://api.folksonomy.openfoodfacts.org/keys');
	return await res.json();
}

export async function putFolksonomyTag(
	tag: FolksonomyTag,
	fetch: (url: string, options?: RequestInit) => Promise<Response>
): Promise<boolean> {
	const res = await wrapFetch(fetch)('https://api.folksonomy.openfoodfacts.org/product', {
		method: 'PUT',
		body: JSON.stringify(tag),
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + get(preferences).folksonomy.authToken
		}
	});

	return res.status === 200;
}

export async function createFolksonomyTag(
	tag: FolksonomyTag,
	fetch: (url: string, options?: RequestInit) => Promise<Response>
): Promise<boolean> {
	const res = await wrapFetch(fetch)('https://api.folksonomy.openfoodfacts.org/product', {
		method: 'POST',
		body: JSON.stringify(tag),
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + get(preferences).folksonomy.authToken
		}
	});

	return res.status === 200;
}

export async function deleteFolksonomyTag(
	tag: FolksonomyTag,
	fetch: (url: string, options?: RequestInit) => Promise<Response>
) {
	const res = await wrapFetch(fetch)(
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

export async function getProducts(
	fetch: (url: string, options?: RequestInit) => Promise<Response>,
	key: string,
	value?: string
): Promise<FolksonomyTag[]> {
	const params = new URLSearchParams({ k: key });
	if (value) params.append('v', value);

	const res = await wrapFetch(fetch)(`https://api.folksonomy.openfoodfacts.org/products?${params}`);
	return res.json();
}
