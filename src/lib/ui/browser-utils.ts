/**
 * Measures the largest average width of two neighbouring labels after wrapping
 * at hyphens. Each label's width is the width of its widest segment.
 *
 * @param labels - Labels to measure in display order.
 * @param font - Canvas font used to measure the labels.
 * @returns The largest neighbouring average in pixels, or zero if there are
 * fewer than two labels or a 2D canvas context is unavailable.
 * @throws If called outside the browser.
 */
export function neighbourLabelWidth(labels: string[], font: string): number {
	if (!document || document.createElement === undefined) {
		throw new Error('neighbourLabelWidth can only be used in the browser');
	}

	// This will be GC-ed once the function exits
	const canvas = document.createElement('canvas');
	if (!canvas) return 0; // Browser does not support canvas element

	const context = canvas.getContext('2d');
	if (!context) return 0; // Browser does not support 2D canvas context

	context.font = font;

	const widths = labels.map((text) =>
		Math.max(...text.split('-').map((part) => context.measureText(part).width))
	);
	return Math.max(0, ...widths.slice(1).map((w, i) => (w + widths[i]) / 2));
}
