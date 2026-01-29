export const NO_MARGIN_ROUTES = [/^\/static\//, /^\/$/, /^\/compare/];

export function shouldBeContainer(pageUrl: string) {
	return NO_MARGIN_ROUTES.find((it) => it.test(pageUrl)) != undefined;
}
