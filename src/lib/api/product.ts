import { API_HOST, PRODUCT_URL, PRODUCT_IMAGE_URL } from '$lib/const';
import { get } from 'svelte/store';
import type { KnowledgePanel } from './knowledgepanels';
import type { Nutriments } from './nutriments';
import { preferences } from '$lib/settings';
import type { ProductAttributeGroup } from '$lib/scoring';

export class ProductsApi {
	private readonly fetch: typeof window.fetch;
	constructor(fetch: typeof window.fetch) {
		this.fetch = fetch;
	}

	async getProductAttributes(barcode: string): Promise<ProductAttribute[]> {
		const params = new URLSearchParams({
			fields: ['product_name', 'code', 'attribute_groups'].join(','),
			lc: get(preferences).lang,
			cc: get(preferences).country,
			product_type: 'all'
		});

		const url = `${API_HOST}/api/v2/product/${barcode}?${params.toString()}`;

		const res = await this.fetch(url, { redirect: 'follow' });

		if (!res.ok) {
			throw new Error(
				`Failed to fetch product attributes for barcode: ${barcode}: ${await res.text()}`
			);
		}

		const data = await res.json();
		return data.product?.attribute_groups || [];
	}

	async getBulkProductAttributes(
		productCodes: string[]
	): Promise<Record<string, ProductAttributeGroup[]>> {
		const params = new URLSearchParams({
			code: productCodes.join(','),
			fields: 'product_name,code,attribute_groups'
		});

		const attributesResponse = await this.fetch(`${API_HOST}/api/v2/search?${params.toString()}`);
		const attributesData = await attributesResponse.json();

		// Create a map of product code to attribute groups
		const attributesByCode: Record<string, ProductAttributeGroup[]> = {};
		for (const product of attributesData.products || []) {
			attributesByCode[product.code] = product.attribute_groups || [];
		}

		return attributesByCode;
	}

	async getProduct<T extends Array<keyof Product>>(
		barcode: string,
		{ fields }: { fields: T } = { fields: ['all', 'knowledge_panels'] as T }
	): Promise<ProductState<Pick<Product, T[number]>>> {
		const url =
			PRODUCT_URL(barcode) +
			'?' +
			new URLSearchParams({
				product_type: 'all',
				fields: fields.join(','),
				lc: get(preferences).lang,
				cc: get(preferences).country
			});
		const res = await this.fetch(url, { redirect: 'follow' });
		return await res.json();
	}

	async addOrEditProductV2(product: Product & { comment?: string }) {
		const url = `${API_HOST}/cgi/product_jqm2.pl`;

		const username = get(preferences).username;
		const password = get(preferences).password;

		if (!username || !password) throw new Error('No username or password set');

		const languageCodes = Object.keys(product.languages_codes);
		const productNames = languageCodes.reduce(
			(acc, lang) => {
				const productName = getProductNameInLang(product, lang);
				if (productName != null) {
					acc[`product_name_${lang}`] = productName;
				}
				return acc;
			},
			{} as Record<string, string>
		);
		const ingredientsTexts = languageCodes.reduce(
			(acc, lang) => {
				const ingredientsText = getProductIngredientsInLang(product, lang);
				if (ingredientsText != null) {
					acc[`ingredients_text_${lang}`] = ingredientsText;
				}
				return acc;
			},
			{} as Record<string, string>
		);

		const body = formData({
			code: product.code,
			user_id: username,
			password: password,
			categories: product.categories,
			labels: product.labels,
			brands: product.brands,
			quantity: product.quantity,
			serving_size: product.serving_size,
			stores: product.stores,
			origins: product.origins,
			countries: product.countries,
			emb_codes: product.emb_codes,
			packaging: product.packaging,
			manufacturing_places: product.manufacturing_places,
			comment: product.comment ?? '',

			product_name: product.product_name,
			...productNames,

			ingredients_text: product.ingredients_text,
			...ingredientsTexts
		});

		const res = await this.fetch(url, {
			method: 'POST',
			body,
			headers: { 'Content-Type': 'multipart/form-data' }
		});

		return res.status === 200;
	}

	/**
	 * Uploads an image to OpenFoodFacts for a product.
	 * @param barcode Product barcode
	 * @param imageFile The image file to upload
	 * @param imagefield The type of image (e.g. 'front_en', 'ingredients_en', etc.)
	 * @param user_id Username for authentication
	 * @param password Password for authentication
	 */
	async uploadImage(barcode: string, imageFile: File, imagefield: string) {
		const url = `${API_HOST}/cgi/product_image_upload.pl`;
		const formData = new FormData();
		formData.append('code', barcode);
		formData.append('imagefield', imagefield);
		formData.append(`imgupload_${imagefield}`, imageFile);

		try {
			const res = await this.fetch(url, {
				method: 'POST',
				body: formData
			});

			if (!res.ok) {
				console.error(`Image upload failed for barcode ${barcode}. Status: ${res.status}`);
				throw new Error(`Failed to upload image for product with barcode: ${barcode}`);
			}

			const result = await res.json();
			console.log('Image upload successful:', result);
			return result;
		} catch (err) {
			console.error('Error during image upload:', err);
			throw err;
		}
	}

	async getProductReducedForCard(barcode: string): Promise<ProductState<ProductReduced>> {
		const params = new URLSearchParams({
			fields: REDUCED_FIELDS.join(','),
			lc: get(preferences).lang
		});

		const res = await this.fetch(`${PRODUCT_URL(barcode)}?${params.toString()}`);
		const productState = (await res.json()) as ProductState<ProductReduced>;

		return productState;
	}

	async getProductName(barcode: string): Promise<Pick<Product, 'product_name'> | null> {
		const params = new URLSearchParams({
			fields: 'product_name',
			lc: get(preferences).lang
		});

		const res = await this.fetch(PRODUCT_URL(barcode) + '?' + params);
		const productState = (await res.json()) as ProductState<Pick<Product, 'product_name'>>;

		if (productState.status !== 'success') return null;
		else return productState.product;
	}
}

/**
 * @deprecated use ProductsApi instead
 */
export async function getProduct(
	barcode: string,
	fetch: typeof window.fetch
): Promise<ProductState> {
	return new ProductsApi(fetch).getProduct(barcode);
}

export type ProductStateBase = {
	result: {
		id: string;
		name: string;
		lc_name: string;
	};
};

export type ProductStateError = {
	field: { id: string; value: string };
	impact: { lc_name: string; name: string; id: string };
	message: { lc_name: string; name: string; id: string };
};

export type ProductStateFailure = ProductStateBase & {
	status: 'failure';
	errors: ProductStateError[];
};

export type ProductStateFound<T = Product> = ProductStateBase & { product: T } & (
		| { status: 'success' }
		| { status: 'success_with_warnings'; warnings: object[] }
		| { status: 'success_with_errors'; errors: ProductStateError[] }
	);

export type ProductState<T = Product> = ProductStateBase &
	(ProductStateFound<T> | ProductStateFailure);

export type ProductSearch<T = Product> = {
	count: number;
	page: number;
	page_count: number;
	page_size: number;
	products: T[];
	skip: number;
};

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

type LangIngredient = `ingredients_text_${string}`;
type LangProduct = `product_name_${string}`;

type ImageSize = {
	h: number;
	w: number;
};

export type SelectedImage = {
	angle: number;
	coordinates_image_size: string;
	geometry: string;
	imgid: string;
	normalize: string | boolean | null;
	rev: string;
	sizes: {
		100: ImageSize;
		200: ImageSize;
		400: ImageSize;
		full: ImageSize;
	};
	white_magic: string | boolean | null;
	x1: string;
	x2: string;
	y1: string;
	y2: string;
};

export type RawImage = {
	url: string;
	sizes: {
		full: ImageSize;
		100: ImageSize;
		400: ImageSize;
	};
	uploaded_t: string;
	uploader: string;
};

export type ProductDataSection = {
	created_t: number;
	creator: string;
	last_modified_t: number;
	last_editor: string;
	editors_tags: string[];
	last_checked_t: number;
	checkers_tags: string[];
	states_hierarchy: string[];
};

export type Product = ProductDataSection & {
	knowledge_panels: Record<string, KnowledgePanel>;
	product_name: string;
	[lang: LangProduct]: string;
	_id: string;
	code: string;
	_keywords: string[];
	additives_n: number;
	ingredients: {
		id: string;
		percent: number;
		percent_estimate: number;
		percent_max: number;
		percent_min: number;
		text: string;
		vegan: string;
		vegetarian: string;
	}[];
	additives_tags: string[];

	ingredients_text: string;
	[lang: LangIngredient]: string;

	image_front_url: string;
	image_front_small_url: string;

	image_ingredients_url: string;
	image_ingredients_small_url: string;
	image_ingredients_thumb_url: string;

	images: Record<string, SelectedImage | RawImage>;

	image_nutrition_url: string;
	image_nutrition_small_url: string;
	image_nutrition_thumb_url: string;

	quantity: string;
	serving_size: string;
	nutriscore_grade: string;
	ecoscore_grade: string;
	nova_group: number;

	packaging: string;
	manufacturing_places: string;

	brands: string;
	brands_tags: string[];

	categories: string;
	categories_tags: string[];
	categories_hierarchy: object[];

	stores: string;
	stores_tags: string[];

	labels: string;
	labels_tags: string[];
	product_type: string;

	origins: string;
	origins_tags: string[];

	countries: string;
	countries_tags: string[];

	emb_codes: string;
	emb_codes_tags: string[];

	nutriments: Nutriments;

	no_nutrition_data?: boolean;

	source: {
		fields: string[];
		id: string;
		images: object[];
		import_t: number;
		manufacturer: number | string;
		name: string;
		source_licence: string;
		source_licence_url: string;
		url?: string;
	};

	link: string;

	languages_codes: {
		[lang: string]: number;
	};
	lang: string;
};

const REDUCED_FIELDS = [
	'image_front_small_url',
	'code',
	'product_name',
	'brands',
	'quantity',
	'nutriscore_grade',
	'ecoscore_grade',
	'nova_group',
	'product_type'
] as const;

export type ProductReduced = Pick<Product, (typeof REDUCED_FIELDS)[number]>;

/** @deprecated */
export async function getProductReducedForCard(
	barcode: string,
	fetch: typeof window.fetch
): Promise<ProductState<ProductReduced>> {
	return new ProductsApi(fetch).getProductReducedForCard(barcode);
}
/** @deprecated */
export async function getProductName(
	fetch: typeof window.fetch,
	barcode: string
): Promise<Pick<Product, 'product_name'> | null> {
	return new ProductsApi(fetch).getProductName(barcode);
}

/** @deprecated */
export async function addOrEditProductV2(product: Product, fetch: typeof window.fetch) {
	return new ProductsApi(fetch).addOrEditProductV2(product);
}

function getProductNameInLang(product: Product, lang: string) {
	return product[`product_name_${lang}`] ?? product.product_name;
}

function getProductIngredientsInLang(product: Product, lang: string) {
	return product[`ingredients_text_${lang}`] ?? product.ingredients_text;
}

function formData(data: Record<string, string | Blob>) {
	const form = new FormData();
	for (const [key, value] of Object.entries(data)) {
		form.append(key, value);
	}
	return form;
}

/**
 * Gets URL for a product image based on its barcode and image name
 */
export function getProductImageUrl(
	barcode: string,
	imageName: string,
	images: Record<string, SelectedImage | RawImage>
): string | null {
	const paddedBarcode = barcode.toString().padStart(13, '0');
	const match = paddedBarcode.match(/^(.{3})(.{3})(.{3})(.*)$/);
	if (!match) {
		throw new Error(`Invalid barcode format: ${paddedBarcode}`);
	}

	const path = `${match[1]}/${match[2]}/${match[3]}/${match[4]}`;
	const image = images[imageName];

	if (!image) {
		return null;
	}

	let filename;
	if ('rev' in image) {
		const rev = image.rev;
		filename = `${imageName}.${rev}.400.jpg`;
	} else {
		filename = `${imageName}.400.jpg`;
	}
	return PRODUCT_IMAGE_URL(`${path}/${filename}`);
}
