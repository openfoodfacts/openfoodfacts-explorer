import * as Sentry from '@sentry/sveltekit';
import { PUBLIC_SENTRY_DSN } from '$app/env/public';

if (PUBLIC_SENTRY_DSN) {
	Sentry.init({
		dsn: PUBLIC_SENTRY_DSN,

		tracesSampleRate: 1.0

		// uncomment the line below to enable Spotlight (https://spotlightjs.com)
		// spotlight: import.meta.env.DEV,
	});
}
