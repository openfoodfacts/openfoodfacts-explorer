import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://6a3e1451763425bd80a12c9548969f22@o241488.ingest.us.sentry.io/4509950733320194',

	dataCollection: {
		userInfo: false,
		cookies: false,
		httpHeaders: false,
		httpBodies: [],
		urlQueryParams: false,
		graphQL: { document: false, variables: false },
		genAI: { inputs: false, outputs: false },
		databaseQueryData: false,
		queues: false,
		stackFrameVariables: false
	},
	tracesSampleRate: 0

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});
