import { handleErrorWithSentry } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
    dsn: 'https://6a3e1451763425bd80a12c9548969f22@o241488.ingest.us.sentry.io/4509950733320194',

    tracesSampleRate: 0.1,
	
    beforeSend(event: any, hint: any) {
        const error = hint?.originalException;
        if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
            return null;
        }
        return event;
    }
});

export const handleError = handleErrorWithSentry();