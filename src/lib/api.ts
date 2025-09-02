import { Robotoff } from '@openfoodfacts/openfoodfacts-nodejs';
import { wrapFetchWithCredentials } from './api/utils';
import { ROBOTOFF_URL } from './const';

export * from './api/taxonomy/api';
export * from './api/taxonomy/types';

export * from './api/product';
export * from './api/nutriments';

export * from './api/knowledgepanels';

export function createRobotoffApi(fetch: typeof window.fetch) {
	const { fetch: wrappedFetch, url } = wrapFetchWithCredentials(fetch, new URL(ROBOTOFF_URL));
	return new Robotoff(wrappedFetch, { baseUrl: url.toString() });
}
