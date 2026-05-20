import { browser } from '$app/environment';

/**
 * Copy text to clipboard. Returns true on success, false on failure.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
	if (!browser) return false;

	try {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			await navigator.clipboard.writeText(text);
			return true;
		}

		// Fallback for older browsers
		const ta = document.createElement('textarea');
		ta.value = text;
		ta.style.position = 'fixed';
		ta.style.left = '-9999px';
		document.body.appendChild(ta);
		ta.select();
		const ok = document.execCommand('copy');
		document.body.removeChild(ta);
		return !!ok;
	} catch (err) {
		return false;
	}
}
