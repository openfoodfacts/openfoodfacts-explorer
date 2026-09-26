import * as iso from 'iso-3166-1';

import type { Country, Taxonomy } from '@openfoodfacts/openfoodfacts-nodejs';

/**
 * Resolve a taxonomy entry to its ISO numeric code, trying both alpha-3 and alpha-2 codes.
 */
function resolveNumericId(entry: Country): string | null {
	// Try alpha-3 first, then fall back to alpha-2
	const alpha3 = entry.country_code_3?.en;
	if (alpha3) {
		const info = iso.whereAlpha3(alpha3);
		if (info) return info.numeric.padStart(3, '0');
	}
	const alpha2 = entry.country_code_2?.en;
	if (alpha2) {
		const info = iso.whereAlpha2(alpha2);
		if (info) return info.numeric.padStart(3, '0');
	}
	return null;
}

/**
 * Build country data map from taxonomy and facet tags.
 * Only includes countries that have facet data (products != null).
 * This preserves the distinction between missing data and explicit zero.
 */
export function buildCountryData(
	taxo: Taxonomy<Country>,
	facetTags: Array<{ id: string; products: number }>
): Map<string, { name: string; products: number }> {
	const productsByTaxoId = new Map<string, number>(
		facetTags.map(({ id, products }) => [id, products])
	);

	const countryData = new Map<string, { name: string; products: number }>();
	for (const [id, entry] of Object.entries(taxo)) {
		const numericId = resolveNumericId(entry);
		if (!numericId) continue;

		const products = productsByTaxoId.get(id);
		if (products == null) continue;

		countryData.set(numericId, {
			name: entry.name?.en ?? id,
			products
		});
	}

	return countryData;
}
