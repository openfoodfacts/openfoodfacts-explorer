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
	CLIENT_IP_ALLOWED_ORIGINS: {
		public: false,
		schema: (input) => {
			const origins = new Set<string>();

			const envVarVal = (input ?? '').split(/\s+/);

			const validateUrl = (url: URL) =>
				url.protocol === 'https:' &&
				!url.username &&
				!url.password &&
				url.pathname === '/' &&
				!url.search &&
				!url.hash;

			for (const value of envVarVal) {
				if (!value) continue;
				const url = new URL(value);
				if (!validateUrl(url)) {
					throw new Error(
						`Invalid CLIENT_IP_ALLOWED_ORIGINS value: ${value}.` +
							` Must be a valid HTTPS URL with no path, query, or fragment.`
					);
				}
				origins.add(url.origin);
			}
			return origins;
		}
	},
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
