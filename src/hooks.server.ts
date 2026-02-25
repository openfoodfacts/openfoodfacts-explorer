import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import type { Handle } from '@sveltejs/kit';
import { locale } from '$lib/i18n';

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
	const lang = event.request.headers.get('accept-language')?.split(',')[0];
	if (lang) {
		locale.set(lang);
	}

	return resolve(event, {
		// Replace the %lang% placeholder in app.html with the user's active language
		// from the accept-language header to ensure proper accessibility and SEO.
		transformPageChunk: ({ html }) => {
			return html.replace('%lang%', lang || 'en');
		},
		filterSerializedResponseHeaders(name) {
			return ['content-length', 'content-type', 'etag', 'cache-control'].includes(
				name.toLowerCase()
			);
		}
	});
});

export const handleError = Sentry.handleErrorWithSentry();
