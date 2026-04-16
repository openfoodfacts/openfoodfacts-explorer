export const wrapFetch =
	(fetch: (url: string, options?: RequestInit) => Promise<Response>) =>
	(url: string, options?: RequestInit) =>
		fetch(url, { ...options });

/**
 * Maps a photo type to its corresponding OpenFoodFacts imagefield value
 * @param type - The photo type (e.g., 'Front', 'Ingredients', 'Nutrition', 'Packaging')
 * @param languageCode - The language code to append (e.g., 'en', 'fr')
 * @param photoTypes - Array of photo type definitions with id and label
 * @returns The formatted imagefield string for OpenFoodFacts API
 */
export function getImageFieldName(
	type: string,
	languageCode: string,
	photoTypes: Array<{ id: string; label: string }> = [
		{ id: 'front', label: 'Front' },
		{ id: 'ingredients', label: 'Ingredients' },
		{ id: 'nutrition', label: 'Nutrition' },
		{ id: 'packaging', label: 'Packaging' }
	]
): string {
	const typeId = photoTypes.find((pt) => pt.label === type)?.id || type.toLowerCase();

	switch (typeId) {
		case 'front':
			return `front_${languageCode}`;
		case 'ingredients':
			return `ingredients_${languageCode}`;
		case 'nutrition':
			return `nutrition_${languageCode}`;
		case 'packaging':
			return `packaging_${languageCode}`;
		default:
			return `${typeId}_${languageCode}`;
	}
}

export function deduplicate<T>(array: T[], key: (el: T) => string): T[] {
	const seen = new Set<string>();
	return array.filter((el) => {
		if (seen.has(key(el))) return false;
		seen.add(key(el));
		return true;
	});
}

export function requireInt(value: string | null, error: () => never) {
	if (value == null) {
		error();
	}
	const intValue = parseInt(value, 10);
	if (isNaN(intValue)) {
		error();
	}
	return intValue;
}

/**
 * Validates and sanitizes a redirect URL to prevent Open Redirect vulnerabilities.
 * @param redirectUrl - The URL string to validate
 * @param origin - The application's current origin (e.g. url.origin)
 * @returns A safe relative path if valid, or '/' as a fallback
 */
export function getSafeRedirectUrl(redirectUrl: string | null | undefined, origin: string): string {
	if (!origin) {
		throw new Error(`getSafeRedirectUrl: invalid origin "${origin}"`);
	}

	let normalizedOrigin: string;
	try {
		normalizedOrigin = new URL(origin).origin;
	} catch {
		throw new Error(`getSafeRedirectUrl: invalid origin "${origin}"`);
	}

	if (!redirectUrl || !redirectUrl.startsWith('/') || redirectUrl.startsWith('//')) {
		return '/';
	}

	try {
		const targetUrl = new URL(redirectUrl, normalizedOrigin);
		if (targetUrl.origin !== normalizedOrigin) {
			return '/';
		}
		// Return only the relative portion to ensure safety
		return targetUrl.pathname + targetUrl.search + targetUrl.hash;
	} catch {
		return '/';
	}
}
