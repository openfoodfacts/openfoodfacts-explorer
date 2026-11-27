import { sequence, type Handle, type HandleFetch } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import { clearWindow } from 'isomorphic-dompurify';

import { redirect } from '@sveltejs/kit';
import { parseUrlLocation } from '#lib/url-location.js';
import { resolveAvailableLocale } from '#lib/i18n/index.js';
import { withRequestLocale } from '#lib/server/request-locale.js';
import { locationRedirect } from '#lib/server/location-redirect.js';
import { ServerTiming } from '#lib/server/timing.ts';
import { withClientIp } from '#lib/server/client-ip.js';
import { dev } from '$app/env';
import { CLIENT_IP_ALLOWED_ORIGINS } from '$app/env/private';

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
	// Server timing setup
	const startTime = performance.now();

	const acceptLanguage = event.request.headers.get('accept-language');
	const destination = locationRedirect(event.url, acceptLanguage);
	if (destination) redirect(307, destination);
	const urlLocation = parseUrlLocation(event.url.pathname);
	// FIXME: We only consider the first language in Accept-Language.
	const lang = resolveAvailableLocale(
		urlLocation?.language ?? acceptLanguage?.split(',')[0]?.split(';')[0].trim()
	);
	event.locals.timing = new ServerTiming();

	const resolved = await withRequestLocale(lang, () =>
		resolve(event, {
			transformPageChunk: ({ html }) => {
				return html.replace('%lang%', lang);
			},
			filterSerializedResponseHeaders(name) {
				return ['content-length', 'content-type', 'etag', 'cache-control'].includes(
					name.toLowerCase()
				);
			}
		})
	);

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

	// If the request is to a trusted origin, add the client's IP address to the request headers.
	const reqWithClientIp = withClientIp(
		request,
		() => event.getClientAddress(),
		CLIENT_IP_ALLOWED_ORIGINS
	);

	return event.locals.timing.measure(`fetch-${kind}`, () => fetch(reqWithClientIp), desc);
};

export const handleError = Sentry.handleErrorWithSentry();
