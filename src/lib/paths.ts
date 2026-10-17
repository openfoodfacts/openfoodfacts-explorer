import { resolve as svelteResolve } from '$app/paths';
import type {
	PathnameWithSearchOrHash,
	RouteId,
	RouteIdWithSearchOrHash,
	RouteParams
} from '$app/types';
import { page } from '$app/state';

import { withLocationPrefix } from '#lib/location-link.js';
import { parseUrlLocation } from '#lib/url-location.js';

type StripSearchOrHash<T extends string> = T extends `${infer U}?${string}`
	? U
	: T extends `${infer U}#${string}`
		? U
		: T;

type ResolveArgs<T extends RouteIdWithSearchOrHash | PathnameWithSearchOrHash> =
	T extends `/${string}`
		? StripSearchOrHash<T> extends infer U extends RouteId
			? RouteParams<U> extends Record<string, never>
				? [route: T]
				: [route: T, params: RouteParams<U>]
			: [never]
		: [pathname: T];

/** Resolve a typed SvelteKit path and include the active language and region prefix. */
export function resolve<T extends RouteIdWithSearchOrHash | PathnameWithSearchOrHash>(
	...args: ResolveArgs<T>
): string {
	return resolveForPathname(page.url.pathname, ...args);
}

/** Resolve a typed SvelteKit path using the location from a request URL. */
export function resolveForUrl<T extends RouteIdWithSearchOrHash | PathnameWithSearchOrHash>(
	url: URL,
	...args: ResolveArgs<T>
): string {
	return resolveForPathname(url.pathname, ...args);
}

function resolveForPathname<T extends RouteIdWithSearchOrHash | PathnameWithSearchOrHash>(
	pathname: string,
	...args: ResolveArgs<T>
): string {
	const location = parseUrlLocation(pathname);
	return withLocationPrefix(svelteResolve(...args), location);
}
