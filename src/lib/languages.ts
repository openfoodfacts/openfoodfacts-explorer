import ISO6391 from 'iso-639-1';
import { getLocale } from './i18n';

export function getLanguageName(code: string, locale: string = getLocale()): string {
	// Using Intl.DisplayNames to get the language name from the code
	if (typeof Intl.DisplayNames === 'function') {
		const displayNames = new Intl.DisplayNames([locale], { type: 'language' });
		const name = displayNames.of(code);
		// Some runtimes lack data for rarer languages and return the code itself
		if (name && name !== code) return name;
	}
	// Fallback: use the English name from ISO 639-1, or the code itself
	return ISO6391.getName(code) || code;
}
