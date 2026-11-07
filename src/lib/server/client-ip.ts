export function withClientIp(
	request: Request,
	getClientAddress: () => string,
	trustedOrigins: ReadonlySet<string>
): Request {
	if (!trustedOrigins.has(new URL(request.url).origin)) return request;

	const headers = new Headers(request.headers);
	headers.delete('x-real-ip');
	let address: string | undefined;
	try {
		address = getClientAddress();
	} catch {
		// Prerendering and some adapters do not provide a client address.
	}

	if (!address) return new Request(request, { headers });
	headers.set('x-real-ip', address);
	// Fetch follows redirects without invoking handleFetch again. Refuse them so
	// the address cannot be sent to an untrusted redirect destination.
	return new Request(request, { headers, redirect: 'error' });
}
