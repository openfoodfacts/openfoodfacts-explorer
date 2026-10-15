import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_OFF_BASE_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_ENVIRONMENT: { public: true, schema: (input) => input ?? '' },
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
