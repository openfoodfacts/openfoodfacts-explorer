import { handleErrorWithSentry } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://6a3e1451763425bd80a12c9548969f22@o241488.ingest.us.sentry.io/4509950733320194',

	tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
