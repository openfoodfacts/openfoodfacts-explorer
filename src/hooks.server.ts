import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return ['content-length', 'content-type', 'etag', 'cache-control'].includes(
				name.toLowerCase()
			);
		}
	});
});

export const handleError = Sentry.handleErrorWithSentry();
