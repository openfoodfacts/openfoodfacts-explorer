import { describe, expect, it } from 'vitest';
import {
	CERTIFICATE_LAYOUT,
	CERTIFICATE_SIZE,
	getBadgeStyle,
	layoutBadges,
	type CertificateBadge,
	type CertificateRow
} from './certificate.js';

function row(label: string, count: number): CertificateRow {
	const badges: CertificateBadge[] = Array.from({ length: count }, (_, index) => ({
		label: String(index + 1),
		unlocked: index < count / 2,
		tier: index,
		isTop: index === count - 1
	}));
	return { label, badges };
}

describe('layoutBadges', () => {
	const rows = [row('Creator', 13), row('Editor', 13), row('Photographer', 10)];
	const placed = layoutBadges(rows);

	it('places every badge once', () => {
		expect(placed).toHaveLength(13 + 13 + 10);
	});

	it('keeps every circle inside the certificate, within the padding', () => {
		const { padding } = CERTIFICATE_LAYOUT;
		for (const { x, y, radius } of placed) {
			expect(x - radius).toBeGreaterThanOrEqual(padding);
			expect(x + radius).toBeLessThanOrEqual(CERTIFICATE_SIZE - padding);
			expect(y - radius).toBeGreaterThan(0);
			expect(y + radius).toBeLessThan(CERTIFICATE_SIZE);
		}
	});

	it('never overlaps circles of the same row', () => {
		for (const rowIndex of [0, 1, 2]) {
			const inRow = placed.filter((item) => item.rowIndex === rowIndex);
			for (let i = 1; i < inRow.length; i++) {
				const distance = inRow[i].x - inRow[i - 1].x;
				expect(distance).toBeGreaterThanOrEqual(inRow[i].radius * 2);
			}
		}
	});

	it('uses one circle size for every row, no bigger than the maximum', () => {
		const radii = new Set(placed.map((item) => item.radius));
		expect(radii.size).toBe(1);
		expect([...radii][0]).toBeLessThanOrEqual(CERTIFICATE_LAYOUT.maxRadius);
	});

	it('stacks rows from top to bottom', () => {
		const ys = [0, 1, 2].map((index) => placed.find((item) => item.rowIndex === index)!.y);
		expect(ys[0]).toBeLessThan(ys[1]);
		expect(ys[1]).toBeLessThan(ys[2]);
	});

	it('starts right of the row label', () => {
		const { padding, labelWidth } = CERTIFICATE_LAYOUT;
		for (const { x, radius } of placed) {
			expect(x - radius).toBeGreaterThanOrEqual(padding + labelWidth);
		}
	});

	it('handles no rows and empty rows', () => {
		expect(layoutBadges([])).toEqual([]);
		expect(layoutBadges([row('Empty', 0)])).toEqual([]);
	});
});

describe('getBadgeStyle', () => {
	it('gives the special badge a ring', () => {
		expect(getBadgeStyle({ tier: 12, isTop: true }).ring).toBeDefined();
		expect(getBadgeStyle({ tier: 0, isTop: false }).ring).toBeUndefined();
	});

	it('makes silver translucent and the other tiers solid', () => {
		expect(getBadgeStyle({ tier: 2, isTop: false }).fillAlpha).toBeLessThan(1);
		expect(getBadgeStyle({ tier: 4, isTop: false }).fillAlpha).toBe(1);
	});

	it('uses a different colour as the tier rises', () => {
		const fills = [0, 2, 4, 6, 8].map((tier) => getBadgeStyle({ tier, isTop: false }).fill);
		expect(new Set(fills).size).toBe(fills.length);
	});

	it('clamps tiers outside the scale', () => {
		expect(getBadgeStyle({ tier: -3, isTop: false })).toEqual(
			getBadgeStyle({ tier: 0, isTop: false })
		);
		expect(getBadgeStyle({ tier: 99, isTop: false })).toEqual(
			getBadgeStyle({ tier: 9, isTop: false })
		);
	});
});
