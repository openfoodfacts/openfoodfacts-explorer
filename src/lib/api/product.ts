import { API_HOST, PRODUCT_IMAGE_URL } from '$lib/const';
import { get } from 'svelte/store';
import type { KnowledgePanel } from './knowledgepanels';
import type { Nutriments } from './nutriments';
import { preferences } from '$lib/settings';
import { type ProductV3, OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs';
import { wrapFetchWithCredentials } from './utils';

export function createProductsApi(fetch: typeof window.fetch) {
	const { fetch: wrappedFetch, url } = wrapFetchWithCredentials(fetch, new URL(API_HOST));
	return new OpenFoodFacts(wrappedFetch, { host: url.toString() });
}

export class ProductsApi {
	private readonly fetch: typeof window.fetch;
	private readonly off: OpenFoodFacts;

	constructor(fetch: typeof window.fetch) {
		this.fetch = fetch;
		this.off = createProductsApi(fetch);
	}

	async getBulkProductAttributes(
		productCodes: string[]
	): Promise<Record<string, ProductAttributeForScoringGroup[]>> {
		const params = new URLSearchParams({
			code: productCodes.join(','),
			fields: 'product_name,code,attribute_groups'
		});

		const { data, error } = await this.off.apiv2.client.GET('/api/v2/search', {
			params: { query: Object.fromEntries(params) }
		});

		if (!data) {
			throw new Error(`No data returned for bulk product attributes: ${error || 'unknown error'}`);
		}

		// Create a map of product code to attribute groups
		const attributesByCode: Record<string, ProductAttributeForScoringGroup[]> = {};
		for (const product of data.products || []) {
			// @ts-expect-error - FIXME: deduplicate attribute groups definition
			attributesByCode[product.code!] = product.attribute_groups || [];
		}

		return attributesByCode;
	}

	async addOrEditProductV2(product: Product & { comment?: string }) {
		const username = get(preferences).username;
		const password = get(preferences).password;

		if (!username || !password) throw new Error('No username or password set');

		// @ts-expect-error - we should use v3
		return this.off.addOrEditProductV2(product, { password, username });
	}

	// TODO: move this to the sdk
	/**
	 * Upload image using API v3.3 with base64 encoded data
	 * @param barcode Product barcode
	 * @param imageDataBase64 Base64 encoded image data
	 * @param imagefield The type of image (optional, defaults to 'other')
	 */
	async uploadImageV3(barcode: string, imageDataBase64: string, imagefield?: string) {
		const user_id = get(preferences).username ?? undefined;
		const password = get(preferences).password ?? undefined;
		const lc = get(preferences).lang;
		const cc = get(preferences).country;

		return this.off.apiv3.uploadProductImage(barcode, {
			lc,
			cc,
			user_id: user_id,
			password: password,
			image_data_base64: imageDataBase64,
			...(imagefield && {
				selected: {
					[imagefield.split('_')[0]]: {
						[imagefield.split('_')[1] || 'en']: {}
					}
				}
			})
		});
	}

	/**
	 * Select and crop images using API v3.3
	 * @param barcode Product barcode
	 * @param images Object containing image selections and crop parameters
	 */
	async selectAndCropImagesV3(
		barcode: string,
		images: ImageSelectionData
	): Promise<{ data?: ImageOperationResponse; error?: string }> {
		const { data, error } = await this.off.apiv3.client.PATCH('/api/v3/product/{barcode}', {
			params: { path: { barcode } },
			body: { fields: 'updated', product: { images } }
		});

		if (error) {
			return { error: `Failed to select/crop images: ${error}` };
		}

		return { data: data as ImageOperationResponse };
	}

	/**
	 * Unselect an image for a specific language and type
	 * @param barcode Product barcode
	 * @param imageType Image type (front, ingredients, nutrition, etc.)
	 * @param language Language code (en, fr, es, etc.)
	 */
	async unselectImageV3(
		barcode: string,
		imageType: string,
		language: string
	): Promise<{ data?: ImageOperationResponse; error?: string }> {
		const images = {
			selected: {
				[imageType]: {
					[language]: null
				}
			}
		};

		return this.selectAndCropImagesV3(barcode, images);
	}

	async getProductReducedForCard(barcode: string) {
		const fields = [...REDUCED_FIELDS] as Array<keyof ProductV3>;

		return this.off.getProductV3(barcode, { fields });
	}
}

/**
 * @deprecated use ProductsApi instead
 */
export async function getProduct(barcode: string, fetch: typeof window.fetch) {
	return createProductsApi(fetch).getProductV3(barcode);
}

export type ProductStateBase = {
	result: {
		id: string;
		name: string;
		lc_name: string;
	};
};

export type ProductStateError = {
	field?: { id?: string; value?: string };
	impact?: { lc_name?: string; name?: string; id?: string };
	message?: { lc_name?: string; name?: string; id?: string };
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

export type ProductAttribute = {
	id: string;
	name: string;
	grade: string;
	title: string;
	description_short?: string;
	icon_url?: string;
};

export type ProductAttributeGroup = {
	id: string;
	name: string;
	warning?: string;
	attributes: ProductAttribute[];
};

export type ProductAttributeForScoring = {
	id: string;
	match?: number;
	status?: string;
};

export type ProductAttributeForScoringGroup = {
	id: string;
	attributes: ProductAttributeForScoring[];
};

// Image selection and cropping types for v3.3 API
export type ImageGenerationParameters = {
	angle?: number;
	x1?: number;
	y1?: number;
	x2?: number;
	y2?: number;
	coordinates_image_size?: string;
	white_magic?: boolean | string;
	normalize?: boolean | string;
};

export type ImageSelection = {
	imgid: string;
	generation?: ImageGenerationParameters;
};

export type ImageSelectionByLanguage = {
	[language: string]: ImageSelection | null | undefined;
};

export type ImageSelectionByType = {
	[imageType: string]: ImageSelectionByLanguage;
};

export type ImageSelectionData = {
	selected: ImageSelectionByType;
};

// Response type for v3 image upload operations
export type ImageUploadResponse = {
	status: 'success' | 'failure';
	result?: {
		id: string;
		name: string;
	};
	product?: {
		code: string;
		images?: {
			uploaded?: {
				[imgid: string]: {
					imgid: number;
					sizes: {
						[size: string]: {
							h: number;
							w: number;
						};
					};
					uploaded_t: number;
					uploader: string;
				};
			};
		};
	};
	errors?: string[];
	warnings?: string[];
};

// Response type for v3.3 image operations
export type ImageOperationResponse = {
	status: 'success' | 'failure';
	result?: {
		id: string;
		name: string;
	};
	product?: {
		code: string;
		images?: Record<string, SelectedImage | RawImage>;
	};
	errors?: string[];
	warnings?: string[];
};

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
	uploaded_t: number;
	uploader: string;
};

export type ProductDataSection = {
	created_t: number;
	creator: string;
	last_modified_t: number;
	last_editor: string;
	editors_tags?: string[];
	last_checked_t?: number;
	checkers_tags?: string[];
	states_hierarchy?: string[];
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

export type ProductImage = {
	url: string;
	alt: string;
	type: string;
	imgid: number; // The numeric image ID for the API
	typeId: string; // The type ID for the API (front, ingredients, nutrition, packaging, other)
	uploaded_t: number; // Upload timestamp
	uploader: string; // Uploader username
};

/**
 * Select an image for a specific field.
 * @param image - The image to select.
 * @param field - The field to select the image for. It must be in the format `{IMAGE_TYPE}_{LANG}`.
 */
export function selectImage(
	fetch: typeof window.fetch,
	code: string,
	imgid: ProductImage,
	field: string
) {
	const off = createProductsApi(fetch);
	// @ts-expect-error - cropdata should not be mandatory
	return off.cropImage(code, imgid, field, {});
}

/**
 * Convert a File to base64 string
 * @param file The file to convert
 * @returns Promise that resolves to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === 'string') {
				// Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
				const base64 = reader.result.split(',')[1];
				resolve(base64);
			} else {
				reject(new Error('Failed to convert file to base64'));
			}
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}

/**
 * Create image selection data for a single image without cropping
 * @param imageType The type of image (front, ingredients, nutrition, etc.)
 * @param language The language code
 * @param imgid The image ID (string or number)
 */
export function createSimpleImageSelection(
	imageType: string,
	language: string,
	imgid: string | number
): ImageSelectionData {
	return {
		selected: {
			[imageType]: {
				[language]: {
					imgid: imgid.toString()
				}
			}
		}
	};
}

/**
 * Create image selection data with cropping parameters
 * @param imageType The type of image (front, ingredients, nutrition, etc.)
 * @param language The language code
 * @param imgid The image ID (string or number)
 * @param cropParams The cropping parameters
 */
export function createImageSelectionWithCrop(
	imageType: string,
	language: string,
	imgid: string | number,
	cropParams: ImageGenerationParameters
): ImageSelectionData {
	return {
		selected: {
			[imageType]: {
				[language]: {
					imgid: imgid.toString(),
					generation: cropParams
				}
			}
		}
	};
}
