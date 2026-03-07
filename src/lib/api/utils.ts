export function stripTaxonomyPrefix(tag?: string): string {
	if (!tag) return '';
	return tag.replace(/^[a-z0-9-]+:/i, '');
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
