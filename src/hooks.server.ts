import { sequence, type Handle } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import { locale } from '#lib/i18n/index.js';

import { clearWindow } from 'isomorphic-dompurify';

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
	const lang = event.request.headers.get('accept-language')?.split(',')[0];
	if (lang) {
		locale.set(lang);
	}

	const resolved = await resolve(event, {
		transformPageChunk: ({ html }) => {
			// Replace the %lang% placeholder in app.html with the user's active language
			// from the accept-language header to ensure proper accessibility and SEO.
			return html.replace('%lang%', lang || 'en');
		},
		filterSerializedResponseHeaders(name) {
			return ['content-length', 'content-type', 'etag', 'cache-control'].includes(
				name.toLowerCase()
			);
		}
	});
	// Limit referrer details sent to other origins.
	resolved.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	// Prevent browsers from guessing a response's content type.
	resolved.headers.set('x-content-type-options', 'nosniff');
	// Allow this origin to use the camera while blocking microphone access.
	resolved.headers.set('permissions-policy', 'camera=(self), microphone=()');

	// Clear the jsdom window to prevent memory leaks in server-side rendering
	clearWindow();

	return resolved;
});

export const handleError = Sentry.handleErrorWithSentry();
