import { BEAUTY_HOST, BEAUTY_PRODUCT_URL } from '$lib/const';
import type { KnowledgePanel } from './knowledgepanels';
import { get } from 'svelte/store';
import { preferences } from '$lib/settings';
import type { Nutriments } from './nutriments';
export class BeautyApi {
	private readonly fetch: typeof window.fetch;
	constructor(fetch: typeof window.fetch) {
		this.fetch = fetch;
	}
	async getProduct<T extends Array<keyof Product>>(
		barcode: string,
		{ fields }: { fields: T } = { fields: ['all', 'knowledge_panels'] as T }
	): Promise<ProductState<Pick<Product, T[number]>>> {
		const url =
			BEAUTY_PRODUCT_URL(barcode) +
			'?' +
			new URLSearchParams({
				fields: fields.join(','),
				lc: get(preferences).lang,
				cc: get(preferences).country
			});
		const res = await this.fetch(url);
		return await res.json();
	}
	async addOrEditProductV2(product: Product & { comment?: string }) {
		const url = `${BEAUTY_HOST}/cgi/product_jqm2.pl`;

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
			stores: product.stores,
			origins: product.origins,
			countries: product.countries,
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

type RawImage = {
	sizes: {
		full: ImageSize;
		100: ImageSize;
		400: ImageSize;
	};
	uploaded_t: string;
	uploader: string;
};

export type Product = {
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
	nutriscore_grade: string;
	ecoscore_grade: string;
	nova_group: number;

	brands: string;
	brands_tags: string[];

	categories: string;
	categories_tags: string[];
	categories_hierarchy: object[];

	stores: string;
	stores_tags: string[];

	labels: string;
	labels_tags: string[];

	origins: string;
	origins_tags: string[];

	countries: string;
	countries_tags: string[];

	nutriments: Nutriments;

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

