/**
 * Extract product context (barcode) from a pathname.
 * Returns { barcode } when pathname matches /products/:barcode
 */
export function getProductContextFromRoute(pathname: string): { barcode: string } | null {
	if (!pathname) return null;
	// Anchor the product route to the end to avoid matching nested paths
	// e.g. `/products/123/extra` should NOT be treated as a product page.
	// This keeps command registry and product-specific logic scoped correctly.
	const m = pathname.match(/^\/products\/([^/]+)\/?$/);
	if (!m) return null;
	try {
		const barcode = decodeURIComponent(m[1]);
		return { barcode };
	} catch {
		return { barcode: m[1] };
	}
}
