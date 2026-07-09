import type { LocalizedString, TaxoNode } from '@openfoodfacts/openfoodfacts-nodejs';

export type {
	LocalizedString,
	Taxonomy,
	TaxoNode,
	Label,
	Category,
	Store,
	Brand,
	Language,
	Country,
	Allergen
} from '@openfoodfacts/openfoodfacts-nodejs';

export function getOrDefault<T>(localized: Record<string, T>, lang: string = 'en'): T | undefined {
	const nonNullLang = lang?.toLowerCase() ?? 'en';

	return (
		localized[nonNullLang] ?? // try full locale
		localized['xx'] ?? // fallback to neutral language (common for brands)
		localized['en'] ?? // fallback to english
		Object.values(localized)[0] // fallback to first available
	);
}

export type Origin = TaxoNode & object;

export type Unit = TaxoNode & {
	symbol?: LocalizedString;
};
export const TAXONOMIES_NAMES: Record<string, string> = {
	labels: 'Label',
	categories: 'Category',
	stores: 'Store',
	brands: 'Brand',
	countries: 'Country',
	origins: 'Origin',
	languages: 'Language',
	allergens: 'Allergen'
};
