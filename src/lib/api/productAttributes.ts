import { API_HOST } from '$lib/const';

export type Attribute = {
	id: string;
	name: string;
	grade: string;
	title: string;
	description_short?: string;
	icon_url?: string;
};
export type ProductAttribute = {
	id: string;
	name: string;
	attributes: Attribute[];
};
export type ProductAttributes = ProductAttribute[];

export class ProductAttributesApi {
	private fetch: typeof fetch;

	constructor(fetchFn: typeof fetch) {
		this.fetch = fetchFn;
	}

	async getProductAttributes(barcode: string): Promise<ProductAttribute[]> {
		const url = `${API_HOST}/api/v2/product/${barcode}?fields=product_name,code,attribute_groups_en`;

		const res = await this.fetch(url);

		if (!res.ok) {
			throw new Error(`Failed to fetch product attributes for barcode: ${barcode}`);
		}

		const data = await res.json();
		return data.product?.attribute_groups_en || [];
	}
}
