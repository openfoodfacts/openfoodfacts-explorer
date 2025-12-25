export const NO_MARGIN_ROUTES = [/^\/static\//, /^\/$/];

export function shouldBeContainer(pageUrl: string) {
	return NO_MARGIN_ROUTES.find((it) => it.test(pageUrl)) != undefined;
}
