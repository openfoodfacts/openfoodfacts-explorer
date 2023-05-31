export function getOrDefault(localized: Record<string, string>, lang: string) {
	if (localized[lang] != null) return localized[lang];
	else if (localized['en'] != null) return localized['en'];
	else return Object.values(localized)[0];
}

export type Taxo = {
	name: Record<string, string>;
};
export type Label = Taxo & {};

export type Category = Taxo & {};

export type Store = Taxo & {};

export type Brand = Taxo & {};
