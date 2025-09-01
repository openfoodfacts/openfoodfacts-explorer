export function formBody(params: Record<string, string | null | undefined>) {
	const formBody = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value != null) {
			formBody.append(key, value);
		}
	}
	return formBody;
}

export function wrapFetchWithCredentials(
	fetch: typeof globalThis.fetch,
	url: URL
): { fetch: typeof globalThis.fetch; url: URL } {
	let wrappedFetch = fetch;
	if (url.username && url.password) {
		const username = url.username; // copy value
		const password = url.password; // copy value
		wrappedFetch = async (input, init) => {
			const headers = new Headers(init?.headers);
			headers.set('Authorization', 'Basic ' + btoa(username + ':' + password));
			return fetch(input, { ...init, headers });
		};
	}

	url.username = '';
	url.password = '';

	return { fetch: wrappedFetch, url };
}
