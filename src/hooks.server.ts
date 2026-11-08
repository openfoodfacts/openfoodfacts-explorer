import { sequence, type Handle, type HandleFetch } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import { clearWindow } from 'isomorphic-dompurify';

import { locale } from '#lib/i18n/index.js';
import { ServerTiming } from '#lib/server/timing.ts';
import { dev } from '$app/env';

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
	// Server timing setup
	const startTime = performance.now();

	const lang = event.request.headers.get('accept-language')?.split(',')[0];
	if (lang) {
		locale.set(lang);
	}

	event.locals.timing = new ServerTiming();

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

	event.locals.timing.add('total', performance.now() - startTime, 'Total request time');

	// Add server timing header to the response.
	// We could eventually allow this for admin users.
	if (dev) {
		const serverTimingHeader = event.locals.timing.toHeader();
		resolved.headers.append('Server-Timing', serverTimingHeader);
	}

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

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	const url = new URL(request.url);
	const kind = url.origin === event.url.origin ? 'internal' : 'external';
	const desc = `${request.method} ${url.pathname}`.replace(/"/g, '');

	return event.locals.timing.measure(`fetch-${kind}`, () => fetch(request), desc);
};

export const handleError = Sentry.handleErrorWithSentry();
