import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { error } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';
import { locale } from '#lib/i18n/index.js';
import { parseUrlLocation } from '#lib/url-location.js';

import { clearWindow } from 'isomorphic-dompurify';

const UNPREFIXED_PATH_ALLOWLIST = [
	/^\/(?:health|site\.webmanifest)$/,
	/^\/(?:_app|assets)\//,
	/\.[^/]+$/
];

function requireLocationPrefix(pathname: string) {
	const location = parseUrlLocation(pathname);
	const isAllowedPath =
		pathname === '/' || UNPREFIXED_PATH_ALLOWLIST.some((pattern) => pattern.test(pathname));
	if (!location && !isAllowedPath) {
		error(404, 'A language and region prefix is required in the URL');
	}
	return location;
}

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
	const pathname = event.url.pathname;
	const urlLocation = requireLocationPrefix(pathname);

	// Set the locale based on the URL prefix or the accept-language header.
	const lang = urlLocation?.language ?? event.request.headers.get('accept-language')?.split(',')[0];
	if (lang) {
		locale.set(lang);
	}

	// Resolve the request
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
