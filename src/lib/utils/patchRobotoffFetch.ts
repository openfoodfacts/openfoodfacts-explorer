export function patchRobotoffFetch(): void {
	if (
		typeof window === 'undefined' ||
		(window as unknown as { __robotoff_fetch_patched?: boolean }).__robotoff_fetch_patched
	) {
		return;
	}

	(window as unknown as { __robotoff_fetch_patched?: boolean }).__robotoff_fetch_patched = true;
	const originalFetch = window.fetch;

	window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
		const urlStr =
			typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString();

		if (
			urlStr.includes('/api/v1/insights') &&
			urlStr.includes('insight_types=nutrient_extraction') &&
			urlStr.includes('barcode=')
		) {
			try {
				const url = new URL(urlStr, window.location.href);
				if (url.searchParams.has('lc')) {
					url.searchParams.delete('lc');
					if (typeof input === 'string' || input instanceof URL) {
						input = url.toString();
					} else if (input instanceof Request) {
						input = new Request(url.toString(), input);
					}
				}
			} catch {
				/* ignore */
			}
		}
		return originalFetch.call(this, input, init);
	};
}
