/**
 * Web Share utility for cross-browser share functionality
 * Uses native Web Share API with automatic clipboard fallback
 */

import { browser } from '$app/environment';

type ShareData = {
	url: string;
	title?: string;
	text?: string;
};

/**
 * Share content using the Web Share API with clipboard fallback.
 *
 * If native share succeeds (user shares via email, messaging, etc.):
 *   - callbacks.onSuccess is invoked
 *
 * If native share is unavailable or fails, falls back to clipboard copy:
 *   - callbacks.onClipboard is invoked when copy succeeds
 *   - callbacks.onError is invoked when copy fails
 */
export async function shareContent(
	data: ShareData,
	callbacks: {
		onSuccess?: () => void;
		onClipboard?: () => void;
		onError?: () => void;
	} = {}
) {
	if (!browser) {
		throw new Error('shareContent must be called in a browser context');
	}

	const hasShareAPI = navigator.share !== undefined;
	// Note: Safari 16.3 and below don't have navigator.canShare, so we need to handle undefined
	const canShareData = navigator.canShare ? navigator.canShare(data) : true;

	if (hasShareAPI && canShareData) {
		try {
			await navigator.share(data);
			callbacks.onSuccess?.();
			return;
		} catch (error) {
			// Only skip if user explicitly cancelled
			if (error instanceof Error && error.name === 'AbortError') {
				return;
			}
			// Log any other error but continue to clipboard fallback
			console.error('Share API failed:', error);
			// Intentionally fall through to clipboard fallback
		}
	}

	try {
		await navigator.clipboard.writeText(data.url);
		callbacks.onClipboard?.();
	} catch (error) {
		console.error('Failed to copy to clipboard:', error);
		callbacks.onError?.();
	}
}
