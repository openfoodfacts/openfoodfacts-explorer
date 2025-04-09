import { API_HOST } from '$lib/const';

export class ProductAttributesApi {
	private fetch: typeof fetch;

	constructor(fetchFn: typeof fetch) {
		this.fetch = fetchFn;
	}

	async getProductAttributes(barcode: string): Promise<any> {
		const url = `${API_HOST}/api/v2/product/${barcode}?fields=product_name,code,attribute_groups_en`;
		try {
			const res = await this.fetch(url);

			if (!res.ok) {
				throw new Error(`Failed to fetch product attributes for barcode: ${barcode}`);
			}

			const data = await res.json();
			return data.product?.attribute_groups_en || [];
		} catch (err) {
			console.error('Error fetching product attributes:', err);
			return [];
		}
	}
}
