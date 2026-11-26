/** A badge as drawn on the certificate. The text is already formatted and translated. */
export type CertificateBadge = {
	/** Short text inside the circle, for example `500` or `25K`. */
	label: string;
	unlocked: boolean;
	/** Position in the scale, used to pick the colour. */
	tier: number;
	/** The last badge of a scale is the special one. */
	isTop: boolean;
};

export type CertificateRow = {
	label: string;
	badges: CertificateBadge[];
};

export type CertificateData = {
	username: string;
	levelName: string;
	/** For example "14 of 39 badges". */
	badgesText: string;
	title: string;
	awardedTo: string;
	footer: string;
	rows: CertificateRow[];
};

export type PlacedBadge = {
	x: number;
	y: number;
	radius: number;
	rowIndex: number;
	badge: CertificateBadge;
};

export const CERTIFICATE_SIZE = 1080;

export const CERTIFICATE_LAYOUT = {
	padding: 72,
	labelWidth: 210,
	gap: 8,
	maxRadius: 26,
	rowsTop: 730,
	rowHeight: 100
} as const;

const FONT_FAMILY = '"Plus Jakarta Sans Variable", system-ui, sans-serif';

/**
 * Work out where every badge circle goes. All rows share the same circle size, chosen so the
 * longest row fits between the row label and the right padding. Pure, so it can be tested.
 */
export function layoutBadges(rows: readonly CertificateRow[]): PlacedBadge[] {
	const { padding, labelWidth, gap, maxRadius, rowsTop, rowHeight } = CERTIFICATE_LAYOUT;
	const longest = Math.max(0, ...rows.map((row) => row.badges.length));
	if (longest === 0) return [];

	const available = CERTIFICATE_SIZE - padding * 2 - labelWidth;
	const radius = Math.min(maxRadius, Math.floor((available + gap) / longest / 2 - gap / 2));
	const left = padding + labelWidth;

	return rows.flatMap((row, rowIndex) =>
		row.badges.map((badge, index) => ({
			x: left + radius + index * (radius * 2 + gap),
			y: rowsTop + rowIndex * rowHeight,
			radius,
			rowIndex,
			badge
		}))
	);
}

export type BadgeStyle = {
	/** Theme token of the fill colour. */
	fill: string;
	fillAlpha: number;
	/** Theme token of the number colour. */
	text: string;
	/** Theme token of an extra ring, for the special badge. */
	ring?: string;
};

// Same progression as the badges on the dashboard: bronze, silver, gold, then rarer tiers.
const TIER_STYLES: readonly BadgeStyle[] = [
	{ fill: '--color-secondary', fillAlpha: 1, text: '--color-secondary-content' },
	{ fill: '--color-secondary', fillAlpha: 1, text: '--color-secondary-content' },
	{ fill: '--color-base-content', fillAlpha: 0.25, text: '--color-base-content' },
	{ fill: '--color-base-content', fillAlpha: 0.25, text: '--color-base-content' },
	{ fill: '--color-warning', fillAlpha: 1, text: '--color-warning-content' },
	{ fill: '--color-warning', fillAlpha: 1, text: '--color-warning-content' },
	{ fill: '--color-info', fillAlpha: 1, text: '--color-info-content' },
	{ fill: '--color-info', fillAlpha: 1, text: '--color-info-content' },
	{ fill: '--color-accent', fillAlpha: 1, text: '--color-accent-content' },
	{ fill: '--color-accent', fillAlpha: 1, text: '--color-accent-content' }
];

const TOP_STYLE: BadgeStyle = {
	fill: '--color-neutral',
	fillAlpha: 1,
	text: '--color-neutral-content',
	ring: '--color-warning'
};

/** The colours of an unlocked badge. */
export function getBadgeStyle(badge: Pick<CertificateBadge, 'tier' | 'isTop'>): BadgeStyle {
	if (badge.isTop) return TOP_STYLE;
	return TIER_STYLES[Math.min(Math.max(badge.tier, 0), TIER_STYLES.length - 1)];
}

type ColorReader = (token: string) => string;

/** Read theme tokens, so the certificate follows the active theme. */
function createColorReader(): ColorReader {
	const styles = getComputedStyle(document.documentElement);
	return (token) => styles.getPropertyValue(token).trim() || 'currentColor';
}

type TextContext = CanvasRenderingContext2D & { letterSpacing?: string };

function roundedRect(
	context: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) {
	context.beginPath();
	if (typeof context.roundRect === 'function') {
		context.roundRect(x, y, width, height, radius);
	} else {
		context.rect(x, y, width, height);
	}
}

/** Shrink a font until the text fits the given width. */
function fitText(
	context: CanvasRenderingContext2D,
	text: string,
	weight: number,
	size: number,
	maxWidth: number
) {
	let current = size;
	context.font = `${weight} ${current}px ${FONT_FAMILY}`;
	while (current > 20 && context.measureText(text).width > maxWidth) {
		current -= 4;
		context.font = `${weight} ${current}px ${FONT_FAMILY}`;
	}
}

function drawBadge(context: CanvasRenderingContext2D, placed: PlacedBadge, color: ColorReader) {
	const { x, y, radius, badge } = placed;
	context.save();
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.font = `800 ${Math.round(radius * 0.7)}px ${FONT_FAMILY}`;

	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2);

	if (badge.unlocked) {
		const style = getBadgeStyle(badge);
		context.globalAlpha = style.fillAlpha;
		context.fillStyle = color(style.fill);
		context.fill();
		context.globalAlpha = 1;

		if (style.ring) {
			context.lineWidth = 4;
			context.strokeStyle = color(style.ring);
			context.stroke();
		}
		context.fillStyle = color(style.text);
	} else {
		context.globalAlpha = 0.4;
		context.setLineDash([5, 5]);
		context.lineWidth = 2;
		context.strokeStyle = color('--color-base-content');
		context.stroke();
		context.setLineDash([]);
		context.fillStyle = color('--color-base-content');
	}

	context.fillText(badge.label, x, y + 1);
	context.restore();
}

/** Draw the whole certificate on a square canvas context. */
export function renderCertificate(context: CanvasRenderingContext2D, data: CertificateData) {
	const color = createColorReader();
	const size = CERTIFICATE_SIZE;
	const middle = size / 2;
	const { padding } = CERTIFICATE_LAYOUT;
	const spaced = context as TextContext;

	// Background and a double frame.
	context.fillStyle = color('--color-base-100');
	context.fillRect(0, 0, size, size);
	context.strokeStyle = color('--color-secondary');
	context.lineWidth = 8;
	roundedRect(context, 36, 36, size - 72, size - 72, 32);
	context.stroke();
	context.lineWidth = 2;
	roundedRect(context, 58, 58, size - 116, size - 116, 20);
	context.stroke();

	context.textAlign = 'center';
	context.textBaseline = 'middle';

	// Brand line, with a few food emoji.
	context.fillStyle = color('--color-secondary');
	context.font = `800 28px ${FONT_FAMILY}`;
	if (spaced.letterSpacing !== undefined) spaced.letterSpacing = '8px';
	context.fillText('OPEN FOOD FACTS', middle, 130);
	if (spaced.letterSpacing !== undefined) spaced.letterSpacing = '0px';
	context.font = `40px ${FONT_FAMILY}`;
	context.fillText('🧀  🍫  🍎  🥖', middle, 190);

	// Title and recipient.
	context.fillStyle = color('--color-base-content');
	fitText(context, data.title, 800, 58, size - padding * 2);
	context.fillText(data.title, middle, 290);

	context.globalAlpha = 0.7;
	context.font = `400 28px ${FONT_FAMILY}`;
	context.fillText(data.awardedTo, middle, 365);
	context.globalAlpha = 1;

	fitText(context, data.username, 800, 104, size - padding * 2 - 40);
	context.fillText(data.username, middle, 450);

	// Level pill and badge count.
	context.font = `800 40px ${FONT_FAMILY}`;
	const pillWidth = context.measureText(data.levelName).width + 80;
	context.fillStyle = color('--color-secondary');
	roundedRect(context, middle - pillWidth / 2, 520, pillWidth, 76, 38);
	context.fill();
	context.fillStyle = color('--color-secondary-content');
	context.fillText(data.levelName, middle, 559);

	context.fillStyle = color('--color-base-content');
	context.globalAlpha = 0.75;
	context.font = `600 30px ${FONT_FAMILY}`;
	context.fillText(data.badgesText, middle, 640);
	context.globalAlpha = 1;

	// Rows of badges, with the category on the left.
	context.textAlign = 'left';
	context.font = `600 26px ${FONT_FAMILY}`;
	context.fillStyle = color('--color-base-content');
	const { rowsTop, rowHeight } = CERTIFICATE_LAYOUT;
	data.rows.forEach((row, index) => {
		context.fillText(row.label, padding, rowsTop + index * rowHeight);
	});
	for (const placed of layoutBadges(data.rows)) {
		drawBadge(context, placed, color);
	}

	// Footer.
	context.textAlign = 'center';
	context.globalAlpha = 0.65;
	context.fillStyle = color('--color-base-content');
	context.font = `400 24px ${FONT_FAMILY}`;
	context.fillText(data.footer, middle, size - 96);
	context.globalAlpha = 1;
}

async function loadFonts() {
	try {
		await Promise.all(
			[400, 600, 800].map((weight) => document.fonts.load(`${weight} 40px ${FONT_FAMILY}`))
		);
	} catch {
		// Without the site font the system one is used.
	}
}

/** Render the certificate to a PNG image. */
export async function createCertificateBlob(data: CertificateData): Promise<Blob> {
	await loadFonts();

	const canvas = document.createElement('canvas');
	canvas.width = CERTIFICATE_SIZE;
	canvas.height = CERTIFICATE_SIZE;
	const context = canvas.getContext('2d');
	if (!context) throw new Error('Canvas is not supported');
	renderCertificate(context, data);

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Could not create the image'))),
			'image/png'
		);
	});
}

/** Save a blob as a file, for browsers that cannot share files. */
export function downloadBlob(blob: Blob, fileName: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.append(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}
