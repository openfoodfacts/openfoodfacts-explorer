import ISO6391 from 'iso-639-1';
import { getLocale } from './i18n';

export function getLanguageName(code: string, locale: string = getLocale()): string {
	// Using Intl.DisplayNames to get the language name from the code
	if (typeof Intl.DisplayNames === 'function') {
		const displayNames = new Intl.DisplayNames([locale], { type: 'language' });
		return displayNames.of(code) || code;
	}
	// Fallback: return the code itself if Intl.DisplayNames is not supported
	return ISO6391.getName(code) || code;
}

/** English name and the name in that language, same shape as the settings language list. */
export function getLanguageOption(code: string): {
	english: string;
	vernacular: string;
	label: string;
} {
	const english = ISO6391.getName(code) || getLanguageName(code, 'en');
	const vernacular = ISO6391.getNativeName(code) || english;
	return { english, vernacular, label: `${english} (${vernacular})` };
}
