import ISO6391 from 'iso-639-1';
import { getLocale } from './i18n';
import { getLanguageCode } from './settings';

export type LocaleLabelLanguage = {
	language_code_2?: { en?: string | null } | null;
	name?: { en?: string | null; [key: string]: string | null | undefined } | null;
};

function getDisplayName(
	type: 'language' | 'region',
	code: string,
	displayLocale = 'en'
): string | undefined {
	if (typeof Intl.DisplayNames !== 'function') return undefined;
	try {
		return new Intl.DisplayNames([displayLocale], { type }).of(code) ?? undefined;
	} catch {
		return undefined;
	}
}

/** English name first, with the name in that language in parentheses when it differs. */
export function getLocaleLabel(
	code: string,
	languages: readonly LocaleLabelLanguage[] = []
): string {
	const languageCode = getLanguageCode(code);
	const language = languages.find(
		(item) => item.language_code_2?.en?.toLowerCase() === languageCode
	);
	const exonym = language?.name?.en ?? getDisplayName('language', languageCode) ?? languageCode;
	const endonym =
		language?.name?.[languageCode] ??
		getDisplayName('language', languageCode, languageCode) ??
		exonym;
	const region = code
		.replaceAll('_', '-')
		.split('-')
		.slice(1)
		.find((part) => /^[a-z]{2}$/i.test(part) || /^\d{3}$/.test(part))
		?.replace(/^[a-z]{2}$/i, (part) => part.toUpperCase());
	const englishRegion = region && getDisplayName('region', region);
	const nativeRegion = region && getDisplayName('region', region, languageCode);
	const nativeLabel = nativeRegion ? `${endonym} (${nativeRegion})` : endonym;
	const englishLabel = englishRegion ? `${exonym} (${englishRegion})` : exonym;

	return nativeLabel === englishLabel ? nativeLabel : `${englishLabel} (${nativeLabel})`;
}

export function getLanguageName(code: string, locale: string = getLocale()): string {
	// Using Intl.DisplayNames to get the language name from the code
	if (typeof Intl.DisplayNames === 'function') {
		const displayNames = new Intl.DisplayNames([locale], { type: 'language' });
		return displayNames.of(code) || code;
	}
	// Fallback: return the code itself if Intl.DisplayNames is not supported
	return ISO6391.getName(code) || code;
}
