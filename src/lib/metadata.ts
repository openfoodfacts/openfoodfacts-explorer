/**
 * Resolves the domain hostname for social preview meta tags (e.g. twitter:domain).
 */
export function resolveDomain(
	url?: string | URL | { href: string; hostname?: string },
	fallbackUrl?: string | URL | { href: string; hostname?: string },
	overrideDomain?: string
): string {
	if (overrideDomain) {
		return overrideDomain;
	}

	const toUrlString = (
		input?: string | URL | { href: string; hostname?: string }
	): string | undefined => {
		if (!input) return undefined;
		if (typeof input === 'string') return input;
		return input.href;
	};

	const urlStr = toUrlString(url);
	const fallbackStr = toUrlString(fallbackUrl);

	if (urlStr) {
		try {
			return new URL(urlStr, fallbackStr).hostname;
		} catch {
			// fall through to fallbackUrl
		}
	}

	if (fallbackStr) {
		try {
			return new URL(fallbackStr).hostname;
		} catch {
			return '';
		}
	}

	return '';
}
