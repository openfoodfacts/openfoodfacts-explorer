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

	// Try to fetch photographers data, but handle if it doesn't exist
	const photographerResponse = fetch(
		`https://world.openfoodfacts.org/facets/photographers/${user}.json`
	)
		.then((it) => it.json())
		.catch(() => ({ products: [] })) as Promise<{ products: Product[] }>;

	const [contributorData, editorData, photographerData] = await Promise.all([
		contributorResponse,
		editorResponse,
		photographerResponse
	]);

	return {
		user,
		contributor: contributorData,
		editor: editorData,
		photographer: photographerData
	};
};
