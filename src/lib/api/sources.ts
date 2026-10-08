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
 * Validates that a given URL uses a safe web scheme (http: or https:).
 * Prevents execution of unsafe schemes such as javascript:.
 *
 * @param url The candidate URL string to validate.
 * @returns True if the URL is valid and uses http: or https:, false otherwise.
 */
export function isSafeSourceUrl(url: string | null | undefined): boolean {
	if (!url) return false;
	try {
		const parsed = new URL(url);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

/**
 * Normalizes and extracts all external sources attached to a product.
 * Deduplicates sources by id, url, or name while merging their fields lists.
 *
 * @param product The product data containing source or sources.
 * @returns An array of consolidated ProductSource items.
 */
export function extractProductSources(
	product: ProductWithSources | undefined | null
): ProductSource[] {
	if (!product) return [];

	const result: ProductSource[] = [];
	const seenMap = new Map<string, ProductSource>();

	const addSource = (src: ProductSource | undefined | null) => {
		if (!src || typeof src !== 'object') return;
		const key = src.id || src.url || src.name;
		if (key && seenMap.has(key)) {
			// Merge fields from repeated imports of the same source
			const existing = seenMap.get(key)!;
			if (Array.isArray(src.fields)) {
				const merged = Array.from(new Set([...(existing.fields || []), ...src.fields]));
				existing.fields = merged;
			}
			return;
		}

		const copy: ProductSource = {
			...src,
			fields: Array.isArray(src.fields) ? [...src.fields] : (src.fields ?? null)
		};
		if (key) seenMap.set(key, copy);
		result.push(copy);
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
 *
 * @param field The raw field identifier.
 * @returns The lowercase, suffix-stripped field name.
 */
export function normalizeFieldName(field: string): string {
	return field
		.toLowerCase()
		.replace(/_tags$/, '')
		.replace(/_hierarchy$/, '');
}

/**
 * Finds the source responsible for a specific product field.
 * Selects the latest import that supplied or modified the requested field.
 *
 * @param product The product data object.
 * @param fieldName The name of the field to check.
 * @returns The matching ProductSource if found, undefined otherwise.
 */
export function getSourceForField(
	product: ProductWithSources | undefined | null,
	fieldName: string
): ProductSource | undefined {
	if (!product || !fieldName) return undefined;

	const sources = extractProductSources(product);
	const targetNormalized = normalizeFieldName(fieldName);

	// Iterate in reverse (newest import first) to select the latest import
	for (let i = sources.length - 1; i >= 0; i--) {
		const src = sources[i];
		if (Array.isArray(src.fields)) {
			const hasField = src.fields.some(
				(f) => f === fieldName || normalizeFieldName(f) === targetNormalized
			);
			if (hasField) return src;
		}
	}

	return undefined;
}
