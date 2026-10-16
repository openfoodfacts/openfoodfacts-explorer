import { goto as svelteGoto } from '$app/navigation';
import { formatUrlLocation, parseUrlLocation } from '#lib/url-location.js';

/** Navigate while retaining the active URL location prefix. */
export const goto: typeof svelteGoto = (url, options) => {
	if (typeof window === 'undefined') return svelteGoto(url, options);

	const currentLocation = parseUrlLocation(window.location.pathname);
	if (!currentLocation) return svelteGoto(url, options);

	const target = new URL(url, window.location.href);
	if (target.origin !== window.location.origin || parseUrlLocation(target.pathname)) {
		return svelteGoto(url, options);
	}

	const prefix = `/${formatUrlLocation(currentLocation.language, currentLocation.country)}`;
	target.pathname = `${prefix}${target.pathname === '/' ? '' : target.pathname}`;
	return svelteGoto(target, options);
};
