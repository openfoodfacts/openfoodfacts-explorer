import createClient from 'openapi-fetch';
import type { QueryFilter } from '@openfoodfacts/openfoodfacts-nodejs';

// TODO: Replace this client and its local types with SDK find/count operations when available.
// Request and response shapes follow https://query.openfoodfacts.org/openapi.json.
type JsonBody<T> = { content: { 'application/json': T } };
type JsonResponse<T> = { content: { 'application/json': T } };

type QueryProductPaths = {
	'/find': {
		post: {
			requestBody: JsonBody<{
				filter: QueryFilter;
				projection: Record<string, boolean>;
				sort: [string, 1 | -1][];
				limit: number;
				skip: number;
			}>;
			responses: { 200: JsonResponse<Record<string, unknown>[]> };
		};
	};
	'/count': {
		post: {
			requestBody: JsonBody<QueryFilter>;
			responses: { 200: JsonResponse<number> };
		};
	};
};

export function createQueryProductApi(fetch: typeof globalThis.fetch, baseUrl: string) {
	return createClient<QueryProductPaths>({ baseUrl: baseUrl.replace(/\/$/, ''), fetch });
}
