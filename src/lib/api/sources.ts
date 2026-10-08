export interface ProductSource {
	id?: string | null;
	name?: string | null;
	url?: string | null;
	manufacturer?: string | number | null;
	source_licence?: string | null;
	source_licence_url?: string | null;
	import_t?: number | null;
	fields?: string[] | null;
	images?: unknown[] | null;
}

export interface ProductWithSources {
	source?: ProductSource | null;
	sources?: ProductSource[] | null;
	[key: string]: unknown;
}

/**
 * Normalizes and extracts all external sources attached to a product.
 * Deduplicates sources by id, name, or url.
 */
export function extractProductSources(
	product: ProductWithSources | undefined | null
): ProductSource[] {
	if (!product) return [];

	const result: ProductSource[] = [];
	const seenKeys = new Set<string>();

	const addSource = (src: ProductSource | undefined | null) => {
		if (!src || typeof src !== 'object') return;
		const key = src.id || src.url || src.name;
		if (key && seenKeys.has(key)) return;
		if (key) seenKeys.add(key);
		result.push(src);
	};

	if (Array.isArray(product.sources)) {
		for (const src of product.sources) {
			addSource(src);
		}
	}

	if (product.source) {
		addSource(product.source);
	}

	return result;
}

/**
 * Normalizes field names for comparison (e.g. categories_tags vs categories).
 */
function normalizeFieldName(field: string): string {
	return field
		.toLowerCase()
		.replace(/_tags$/, '')
		.replace(/_hierarchy$/, '');
}

/**
 * Finds the source responsible for a specific product field.
 */
export function getSourceForField(
	product: ProductWithSources | undefined | null,
	fieldName: string
): ProductSource | undefined {
	if (!product || !fieldName) return undefined;

	const sources = extractProductSources(product);
	const targetNormalized = normalizeFieldName(fieldName);

	for (const src of sources) {
		if (Array.isArray(src.fields)) {
			const hasField = src.fields.some(
				(f) => f === fieldName || normalizeFieldName(f) === targetNormalized
			);
			if (hasField) return src;
		}
	}

	return undefined;
}
