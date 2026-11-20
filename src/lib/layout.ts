export const NO_MARGIN_ROUTES = [/^\/static\//, /^\/$/, /^\/compare/];

export function shouldBeContainer(pageUrl: string) {
	return NO_MARGIN_ROUTES.some((it) => it.test(stripUrlLocation(pageUrl)));
}
import { stripUrlLocation } from '#lib/url-location.js';
