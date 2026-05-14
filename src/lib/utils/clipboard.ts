import { browser } from '$app/environment';

export async function copyTextToClipboard(text: string): Promise<boolean> {
	if (!browser || text.trim() === '') return false;

	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
			return true;
		}
	} catch (error) {
		console.error('Clipboard API failed:', error);
	}

	return false;
}
