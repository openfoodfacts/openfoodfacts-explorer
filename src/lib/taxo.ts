export type LocalizedString = Record<string, string>;

export function getOrDefault<T>(localized: Record<string, T>, lang: string): T | undefined {
	console.debug('getOrDefault', localized, lang);
	return localized[lang] ?? localized['en'] ?? Object.values(localized)[0];
}

export type Taxo = {
	name: LocalizedString;
	parents?: string[];
	children?: string[];
};

export type Label = Taxo & {
	country: LocalizedString;
	auth_url: LocalizedString;
};

export type Category = Taxo & {
	agribalyse_food_code?: LocalizedString;
	ciqual_food_name?: LocalizedString;
	wikidata?: LocalizedString;
	synonyms?: Record<string, string[]>;
};

export type Store = Taxo & {};

export type Brand = Taxo & {};
