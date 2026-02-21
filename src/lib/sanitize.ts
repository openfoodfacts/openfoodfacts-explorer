import DOMPurify from 'dompurify';

/**
 * Sanitize HTML from API responses to prevent XSS.
 *
 * Knowledge panels receive pre-rendered HTML from the Open Food Facts API.
 * While the API is trusted, this adds a defense-in-depth layer ensuring
 * that no script injection can occur even if upstream data is compromised.
 */
export function sanitizeHtml(dirty: string): string {
	return DOMPurify.sanitize(dirty);
}
