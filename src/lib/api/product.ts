import { API_HOST, PRODUCT_URL, PRODUCT_IMAGE_URL } from '$lib/const';
import { get } from 'svelte/store';
import type { KnowledgePanel } from './knowledgepanels';
import type { Nutriments } from './nutriments';
import { preferences } from '$lib/settings';
import OpenFoodFacts from '@openfoodfacts/openfoodfacts-nodejs';

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
			return result;
		} catch (err) {
			console.error('Error during image upload:', err);
			throw err;
		}
	}

	/**
	 * Upload image using API v3.3 with base64 encoded data
	 * @param barcode Product barcode
	 * @param imageDataBase64 Base64 encoded image data
	 * @param imagefield The type of image (optional, defaults to 'other')
	 */
	async uploadImageV3(barcode: string, imageDataBase64: string, imagefield?: string) {
		const url = `${API_HOST}/api/v3/product/${barcode}/images`;

		const user_id = get(preferences).username;
		const password = get(preferences).password;
		const lc = get(preferences).lang;
		const cc = get(preferences).country;

		if (!user_id || !password) {
			throw new Error('Username and password are required for image upload');
		}

		const body = {
			lc,
			cc,
			user_id,
			password,
			image_data_base64: imageDataBase64,
			...(imagefield && {
				selected: {
					[imagefield.split('_')[0]]: {
						[imagefield.split('_')[1] || 'en']: {}
					}
				}
			})
		};

		try {
			const res = await this.fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(`Failed to upload image: ${JSON.stringify(errorData)}`);
			}

			const result = await res.json();
			return result;
		} catch (err) {
			console.error('Error during v3.3 image upload:', err);
			throw err;
		}
	}

	/**
	 * Select and crop images using API v3.3
	 * @param barcode Product barcode
	 * @param images Object containing image selections and crop parameters
	 */
	async selectAndCropImagesV3(barcode: string, images: ImageSelectionData) {
		const url = `${API_HOST}/api/v3.3/product/${barcode}`;

		const body = {
			fields: 'updated',
			product: {
				images
			}
		};

		try {
			const res = await this.fetch(url, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(`Failed to select/crop images: ${JSON.stringify(errorData)}`);
			}

			const result = await res.json();
			return result;
		} catch (err) {
			console.error('Error during v3.3 image selection/cropping:', err);
			throw err;
		}
	}

	/**
	 * Unselect an image for a specific language and type
	 * @param barcode Product barcode
	 * @param imageType Image type (front, ingredients, nutrition, etc.)
	 * @param language Language code (en, fr, es, etc.)
	 */
	async unselectImageV3(barcode: string, imageType: string, language: string) {
		const images = {
			selected: {
				[imageType]: {
					[language]: null
				}
			}
		};

		return this.selectAndCropImagesV3(barcode, images);
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

export type ProductAttributeForScoring = {
	id: string;
	match?: number;
	status?: string;
};

export type ProductAttributeGroup = {
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

export type ProductImage = {
	url: string;
	alt: string;
	type: string;
	imgid: number; // The numeric image ID for the API
	typeId: string; // The type ID for the API (front, ingredients, nutrition, packaging, other)
};

/**
 * Select an image for a specific field.
 * @param image - The image to select.
 * @param field - The field to select the image for. It must be in the format `{IMAGE_TYPE}_{LANG}`.
 */
export async function selectImage(
	fetch: typeof window.fetch,
	code: string,
	imgid: ProductImage,
	field: string
) {
	try {
		const off = new OpenFoodFacts(fetch);

		// @ts-expect-error - cropdata should not be mandatory
		await off.cropImage(code, imgid, field, {});
	} catch (error) {
		console.error('Error cropping and rotating image:', error);
		throw error;
	}
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

/**
 * Example usage of the v3.3 API for uploading and selecting images
 */
export class ImageApiV3Helper {
	private api: ProductsApi;

	constructor(fetch: typeof window.fetch) {
		this.api = new ProductsApi(fetch);
	}

	/**
	 * Upload an image file and select it for a specific type and language
	 * @param barcode Product barcode
	 * @param imageFile The image file to upload
	 * @param imageType Type of image (front, ingredients, nutrition, etc.)
	 * @param language Language code
	 */
	async uploadAndSelectImage(
		barcode: string,
		imageFile: File,
		imageType: string,
		language: string
	) {
		// Convert file to base64
		const base64Data = await fileToBase64(imageFile);

		// Upload the image
		const uploadResult = await this.api.uploadImageV3(barcode, base64Data);

		if (uploadResult.status === 'success') {
			// Extract imgid from the nested response structure
			let imgid = null;
			const uploadedImages = uploadResult.product?.images?.uploaded;

			if (uploadedImages) {
				const imageKeys = Object.keys(uploadedImages);
				if (imageKeys.length > 0) {
					const firstImageKey = imageKeys[0];
					imgid = uploadedImages[firstImageKey]?.imgid;
				}
			}

			if (imgid) {
				// Select the uploaded image
				const selectionData = createSimpleImageSelection(imageType, language, imgid);
				const selectResult = await this.api.selectAndCropImagesV3(barcode, selectionData);

				return {
					upload: uploadResult,
					selection: selectResult
				};
			} else {
				throw new Error('Failed to extract image ID from upload result');
			}
		}

		const errorMessages =
			uploadResult.errors?.length > 0 ? uploadResult.errors.join(', ') : 'Failed to upload image';
		throw new Error(errorMessages);
	}

	/**
	 * Select and crop an existing image
	 * @param barcode Product barcode
	 * @param imgid Existing image ID
	 * @param imageType Type of image
	 * @param language Language code
	 * @param cropParams Cropping parameters
	 */
	async selectAndCropImage(
		barcode: string,
		imgid: string,
		imageType: string,
		language: string,
		cropParams: ImageGenerationParameters
	) {
		const selectionData = createImageSelectionWithCrop(imageType, language, imgid, cropParams);
		return await this.api.selectAndCropImagesV3(barcode, selectionData);
	}
}
