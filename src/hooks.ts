import { stripUrlLocation } from '#lib/url-location.js';

export function reroute({ url }: { url: URL }): string | undefined {
	return stripUrlLocation(url.pathname);
}
