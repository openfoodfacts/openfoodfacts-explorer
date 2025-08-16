import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const { user } = params;

	const contributorResponse = fetch(
		`https://world.openfoodfacts.org/facets/contributors/${user}.json`
	).then((it) => it.json()) as Promise<{ products: Product[] }>;

	const editorResponse = fetch(`https://world.openfoodfacts.org/facets/editors/${user}.json`).then(
		(it) => it.json()
	) as Promise<{ products: Product[] }>;

	const [contributorData, editorData] = await Promise.all([contributorResponse, editorResponse]);

	return {
		user,
		contributor: contributorData,
		editor: editorData
	};
};
