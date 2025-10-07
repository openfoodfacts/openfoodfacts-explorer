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
