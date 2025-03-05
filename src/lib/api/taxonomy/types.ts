export type LocalizedString = Record<string, string>;

export function getOrDefault<T>(localized: Record<string, T>, lang: string): T | undefined {
	return localized[lang] ?? localized['en'] ?? Object.values(localized)[0];
}

export type Taxonomy<T extends TaxoNode = TaxoNode> = Record<string, T>;

export type TaxoNode = {
	name: LocalizedString;
	parents?: string[];
	children?: string[];
	wikidata_category?: LocalizedString;
	wikidata?: LocalizedString;
	synonyms?: Record<string, string[]>;
};

export type Label = TaxoNode & {
	country: LocalizedString;
	auth_url: LocalizedString;
};

export type Category = TaxoNode & {
	agribalyse_food_code?: LocalizedString;
	ciqual_food_name?: LocalizedString;
};

export type Store = TaxoNode & object;

export type Brand = TaxoNode & object;

export type Origin = TaxoNode & object;

export type Country = TaxoNode & object;

export type Language = TaxoNode & {
	language_code_2: {
		en: string;
	};
	language_code_3: {
		en: string;
	};
};

export const TAXONOMIES_NAMES: Record<string, string> = {
	labels: 'Label',
	categories: 'Category',
	stores: 'Store',
	brands: 'Brand',
	countries: 'Country',
	origins: 'Origin',
	languages: 'Language'
};
