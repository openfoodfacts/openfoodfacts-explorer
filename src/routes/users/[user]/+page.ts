import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
import type { PageLoad } from './$types';

// TODO: remove this
type FacetResponse = {
	count: number;
	products: Product[];
};

export const load: PageLoad = async ({ fetch, params }) => {
	const { user } = params;

	const contributorResponse = fetch(
		`https://world.openfoodfacts.org/facets/contributors/${user}.json`
	).then((it) => it.json()) as Promise<FacetResponse>;

	const editorResponse = fetch(`https://world.openfoodfacts.org/facets/editors/${user}.json`).then(
		(it) => it.json()
	) as Promise<FacetResponse>;

	const [contributorData, editorData] = await Promise.all([contributorResponse, editorResponse]);

	console.debug('contributorData', contributorData);

	return {
		user,
		contributor: contributorData,
		editor: editorData
	};
};
