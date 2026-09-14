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
	const off = new OpenFoodFacts(fetch, {
		type: BACKEND_TYPES[productType ?? 'food']
	});
	return off.getTaxo<T>(taxo);
}
