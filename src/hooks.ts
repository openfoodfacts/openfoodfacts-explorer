import { stripUrlLocation } from '#lib/url-location.js';

export function reroute({ url }: { url: URL }): string | undefined {
	// Routes omit the location prefix, so strip it before SvelteKit matches the pathname.
	return stripUrlLocation(url.pathname);
}
