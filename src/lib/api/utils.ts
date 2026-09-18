import { browser } from '$app/environment';

/**
 * Returns a fetch function safe for SSR use with cross-origin APIs.
 *
 * SvelteKit's `event.fetch` in universal load functions (`+page.ts`)
 * enforces CORS even during SSR, which breaks calls to external APIs
 * that don't return `Access-Control-Allow-Origin` headers.
 *
 * On the **server** this returns native `globalThis.fetch` (no CORS).
 * In the **browser** it returns the caller-provided `fetch` so that
 * the Vite dev-proxy or production routing works correctly.
 */
export function ssrSafeFetch(svelteKitFetch: typeof globalThis.fetch): typeof globalThis.fetch {
	if (browser) {
		return svelteKitFetch;
	}
	// On the server, bypass SvelteKit's CORS-enforcing wrapper
	return globalThis.fetch;
}

export function formBody(params: Record<string, string | null | undefined>) {
	const formBody = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value != null) {
			formBody.append(key, value);
		}
	}
	return formBody;
}

const ALLOWED_CREDENTIALS_REGEX = /^[A-Za-z]*$/;

export function wrapFetchWithCredentials(
	fetch: typeof globalThis.fetch,
	url: URL
): { fetch: typeof globalThis.fetch; url: URL } {
	let wrappedFetch = fetch;
	if (url.username && url.password) {
		const username = url.username; // copy value
		const password = url.password; // copy value

		if (!ALLOWED_CREDENTIALS_REGEX.test(username) || !ALLOWED_CREDENTIALS_REGEX.test(password)) {
			throw new Error('Non-ASCII characters are not allowed in credentials');
		}

		wrappedFetch = async (input, init) => {
			const headers = new Headers(init?.headers);
			headers.set('Authorization', 'Basic ' + btoa(username + ':' + password));
			return fetch(input, { ...init, headers });
		};
	}

	const newUrl = new URL(url.toString());
	newUrl.username = '';
	newUrl.password = '';

	return { fetch: wrappedFetch, url: newUrl };
}
