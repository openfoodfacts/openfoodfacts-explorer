import ISO6391 from 'iso-639-1';

export function getLanguageName(code: string): string {
	// Using Intl.DisplayNames to get the language name from the code
	if (typeof Intl.DisplayNames === 'function') {
		const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
		return displayNames.of(code) || code;
	}
	// Fallback: return the code itself if Intl.DisplayNames is not supported
	return ISO6391.getName(code) || code;
}
