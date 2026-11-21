import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	SEO_CANONICAL_TARGET: {
		public: true,
		schema: (input) => {
			if (!input || input === 'product-opener') return 'product-opener' as const;
			if (input === 'explorer') return 'explorer' as const;
			throw new Error('Expected product-opener or explorer');
		}
	},
	ORIGIN: {
		public: true,
		schema: (input) => {
			if (!input) return undefined;
			const url = URL.parse(input);
			if (url && [url.origin, url.origin + '/'].includes(input)) return url.origin;
		}
	},
	PUBLIC_QUERY_BASE_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_OFF_BASE_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_ENVIRONMENT: { public: true, schema: (input) => input ?? '' },
	PUBLIC_SENTRY_DSN: { public: true, schema: (input) => input ?? '' },
	PUBLIC_FOLKSONOMY_API_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_PRICES_API_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_SEARCH_BASE_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_ROBOTOFF_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_IMAGES_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_NUTRIPATROL_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_AUTH_BASE_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_AUTH_PKCE_ID: { public: true, schema: (input) => input ?? '' },
	PUBLIC_KEYCLOAK_REALM: { public: true, schema: (input) => input ?? '' }
});
