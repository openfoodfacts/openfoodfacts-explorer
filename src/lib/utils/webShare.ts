/**
 * Web Share utility for cross-browser share functionality
 * Uses native Web Share API with automatic clipboard fallback
 */

import { browser } from '$app/environment';
import type { ToastContext } from '$lib/stores/toasts';

type ShareData = {
	url: string;
	title?: string;
	text?: string;
};

type ShareMessages = {
	failedShare?: string;
	copiedLink?: string;
	failedCopy?: string;
};

/**
 * Share content using the Web Share API with clipboard fallback
 * @param data - The data to share (url is required)
 * @param toastCtx - Toast notification context
 * @param messages - Optional custom toast messages (e.g., for i18n)
 */
export async function shareContent(
	data: ShareData,
	toastCtx: ToastContext,
	messages?: ShareMessages
) {
	if (!browser) {
		throw new Error('shareContent must be called in a browser context');
	}

	const defaultMessages = {
		failedShare: 'Failed to share',
		copiedLink: 'Link copied to clipboard!',
		failedCopy: 'Failed to copy link'
	};

	const msgs = { ...defaultMessages, ...messages };

	// Try native share API if available and supported
	if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
		try {
			await navigator.share(data);
			return;
		} catch (error) {
			// User likely cancelled the share, not a real error
			if (error instanceof Error && error.name === 'AbortError') {
				return;
			}
			console.error('Share API failed:', error);
			// Only show error if clipboard fallback also fails
		}
	}

	// Fallback to clipboard copy
	try {
		await navigator.clipboard.writeText(data.url);
		toastCtx.success(msgs.copiedLink);
	} catch (error) {
		console.error('Failed to copy to clipboard:', error);
		toastCtx.error(msgs.failedCopy);
	}
}
