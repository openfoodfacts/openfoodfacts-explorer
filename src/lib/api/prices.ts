import createClient from 'openapi-fetch';
import type { paths } from './prices.d';

type PricesQuery = paths['/api/v1/prices']['get']['parameters']['query'];
type PriceStats = paths['/api/v1/prices/stats']['get']['parameters']['query'];

export type PricesCreate =
	paths['/api/v1/prices']['post']['requestBody']['content']['application/json'];
export type Prices =
	paths['/api/v1/prices']['get']['responses']['200']['content']['application/json'];

const BASE_URL = import.meta.env.VITE_PRICES_API_URL;

export function isConfigured() {
	return BASE_URL != null;
}

export class PricesApi {
	private readonly client: ReturnType<typeof createClient<paths>>;
	private readonly fetch: typeof window.fetch;

	constructor(fetch: typeof window.fetch) {
		this.client = createClient({ fetch, baseUrl: BASE_URL, credentials: 'include' });
		this.fetch = fetch;
	}

	getPrices(query: PricesQuery) {
		return this.client.GET('/api/v1/prices', { params: { query } });
	}
	createPrice(body: PricesCreate) {
		return this.client.POST('/api/v1/prices', { body });
	}
	getPriceById(id: number) {
		return this.client.GET('/api/v1/prices/{id}', {
			params: { path: { id } }
		});
	}
	updatePrice(id: number, body: Partial<PricesCreate>) {
		return this.client.PATCH('/api/v1/prices/{id}', { params: { path: { id } }, body });
	}

	deletePrice(id: number) {
		return this.client.DELETE('/api/v1/prices/{id}', { params: { path: { id } } });
	}

	getPriceStats(query: PriceStats) {
		return this.client.GET('/api/v1/prices/stats', { params: { query } });
	}
	login(body: { username: string; password: string }) {
		return this.client.POST('/api/v1/auth', {
			// @ts-expect-error - The type definition doesn't include set_cookie parameter but the API requires it
			params: { query: { set_cookie: true } },
			body,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			bodySerializer: (body) => new URLSearchParams(body as Record<string, string>)
		});
	}

	uploadProof(body: { file: Blob }) {
		return this.client.POST('/api/v1/proofs/upload', {
			// @ts-expect-error - FormData is not supported by openapi-fetch
			body: body,
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
	}

	getProofs() {
		return this.client.GET('/api/v1/proofs');
	}

	async isAuthenticated() {
		const res = await this.client.GET('/api/v1/session');
		return res.response.ok;
	}

	async getStatus() {
		const res = await this.client.GET('/api/v1/status');
		return res.data;
	}
}
