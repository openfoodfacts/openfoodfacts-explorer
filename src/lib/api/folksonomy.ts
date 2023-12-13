import { preferences } from '$lib/settings';
import { get } from 'svelte/store';

import type { paths, components } from './folksonomy.d';
import createClient from 'openapi-fetch';
import { formBody as formBodySerializer } from './utils';

export type FolksonomyTag = components['schemas']['ProductTag'];
export type FolksonomyKey = {
	k: string;
	count: number;
	values: number;
};

const BASE_URL = import.meta.env.VITE_FOLKSONOMY_API_URL;

export function isConfigured() {
	return BASE_URL != null;
}

export class FolksonomyApi {
	private client: ReturnType<typeof createClient<paths>>;
	private fetch: typeof window.fetch;

	constructor(fetch: typeof window.fetch) {
		this.fetch = fetch;
		this.client = createClient({
			baseUrl: BASE_URL,
			fetch,
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + get(preferences).folksonomy.authToken
			}
		});
	}

	async getKeys(): Promise<FolksonomyKey[]> {
		const res = await this.client.GET('/keys');
		return res.response.json();
	}

	async getProducts(key: string, value?: string): Promise<FolksonomyTag[]> {
		const res = await this.client.GET('/products', { params: { query: { k: key, v: value } } });
		return res.response.json();
	}

	async putTag(tag: FolksonomyTag): Promise<boolean> {
		const res = await this.client.PUT('/product', {
			body: tag
		});

		return res.response.status === 200;
	}

	async getProduct(barcode: string) {
		const res = await this.client.GET('/product/{product}', {
			params: { path: { product: barcode } }
		});

		return res;
	}

	async addTag(tag: FolksonomyTag): Promise<boolean> {
		const res = await this.client.POST('/product', {
			body: tag
		});

		return res.response.status === 200;
	}

	async removeTag(tag: FolksonomyTag & { version: number }) {
		const res = await this.client.DELETE('/product/{product}/{k}', {
			params: {
				path: { product: tag.product, k: tag.k },
				query: { version: tag.version }
			}
		});

		return res;
	}

	async login(username: string, password: string) {
		const res = await this.client.POST('/auth', {
			body: { username, password },
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			bodySerializer: formBodySerializer
		});

		if (res.response.status !== 200) throw new Error('Could not authenticate to Folksonomy API');

		const token = (await res.response.json()) as { access_token: string; token_type: string };
		preferences.update((p) => ({
			...p,
			folksonomy: { ...p.folksonomy, authToken: token.access_token }
		}));
	}
}
