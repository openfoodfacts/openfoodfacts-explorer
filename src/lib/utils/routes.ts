/**
 * Extract product context (barcode) from a pathname.
 * Returns { barcode } when pathname matches /products/:barcode
 */
export function getProductContextFromRoute(pathname: string): { barcode: string } | null {
	if (!pathname) return null;
	const m = pathname.match(/^\/products\/(?:([^/]+))(?:\/|$)/);
	if (!m) return null;
	try {
		const barcode = decodeURIComponent(m[1]);
		return { barcode };
	} catch {
		return { barcode: m[1] };
	}
}
