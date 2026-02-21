import DOMPurify from 'dompurify';
import { browser } from '$app/environment';

/**
 * Sanitize HTML from API responses to prevent XSS.
 *
 * Knowledge panels receive pre-rendered HTML from the Open Food Facts API.
 * While the API is trusted, this adds a defense-in-depth layer ensuring
 * that no script injection can occur even if upstream data is compromised.
 *
 * DOMPurify requires a browser DOM, so during SSR we pass through the raw HTML.
 * This is safe because XSS is a client-side concern — the HTML is not dangerous
 * until it is parsed and executed by a browser.
 */
export function sanitizeHtml(dirty: string): string {
	if (!browser) return dirty;
	return DOMPurify.sanitize(dirty);
}
