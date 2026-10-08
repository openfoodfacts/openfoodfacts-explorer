import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs';
import { type ProductType } from '$lib/const';
import type { TaxoNode, Taxonomy } from './types';

type BackendType = NonNullable<NonNullable<ConstructorParameters<typeof OpenFoodFacts>[1]>['type']>;

const BACKEND_TYPES: Record<ProductType, BackendType> = {
	food: 'OFF' as BackendType,
	beauty: 'OBF' as BackendType,
	petfood: 'OPFF' as BackendType,
	product: 'OPF' as BackendType
};

export async function getTaxo<T extends TaxoNode>(
	taxo: string,
	fetch: typeof globalThis.fetch,
	productType?: ProductType
): Promise<Taxonomy<T>> {
	const checkedFetch: typeof globalThis.fetch = async (input, init) => {
		const response = await fetch(input, init);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch taxonomy ${taxo}: ${response.status} ${response.statusText}`
			);
		}
		return response;
	};

	const off = new OpenFoodFacts(checkedFetch, {
		type: BACKEND_TYPES[productType ?? 'food']
	});
	return off.getTaxo<T>(taxo);
}
