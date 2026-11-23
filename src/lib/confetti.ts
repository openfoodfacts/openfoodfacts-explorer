/** Theme tokens used for the confetti colours, so they follow the active theme. */
const COLOR_TOKENS = [
	'--color-secondary',
	'--color-accent',
	'--color-warning',
	'--color-info',
	'--color-success',
	'--color-error'
] as const;

/** Food emoji mixed in with the confetti. */
export const FOOD_EMOJIS = ['🧀', '🍫', '🍎', '🥖', '🍓', '🥑', '🍋', '🍪'] as const;

export type Particle = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	width: number;
	height: number;
	rotation: number;
	spin: number;
	color: string;
	/** Remaining life, from 1 down to 0. */
	life: number;
	/** A food emoji drawn instead of a coloured rectangle. */
	emoji?: string;
};

const GRAVITY = 0.35;
const DRAG = 0.99;
const LIFE_DECAY = 0.012;

export type ParticleOptions = {
	/** Random source, injectable to keep tests deterministic. */
	random?: () => number;
	/** Emoji that can replace some rectangles. */
	emojis?: readonly string[];
	/** Share of particles that are emoji, from 0 to 1. */
	emojiRatio?: number;
};

/** Create the particles of one burst, flying upwards in a wide cone. */
export function createParticles(
	x: number,
	y: number,
	count: number,
	colors: readonly string[],
	{ random = Math.random, emojis = FOOD_EMOJIS, emojiRatio = 0.2 }: ParticleOptions = {}
): Particle[] {
	if (colors.length === 0) return [];

	return Array.from({ length: count }, () => {
		const angle = -Math.PI / 2 + (random() - 0.5) * Math.PI * 1.3;
		const speed = 6 + random() * 9;
		const isEmoji = emojis.length > 0 && random() < emojiRatio;
		const width = isEmoji ? 14 + random() * 8 : 6 + random() * 6;

		return {
			x,
			y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			width,
			height: isEmoji ? width : width * (0.45 + random() * 0.3),
			rotation: random() * Math.PI * 2,
			spin: (random() - 0.5) * 0.4,
			color: colors[Math.floor(random() * colors.length)],
			life: 0.8 + random() * 0.2,
			emoji: isEmoji ? emojis[Math.floor(random() * emojis.length)] : undefined
		};
	});
}

/** Advance the particles by one frame and drop those that are gone. */
export function stepParticles(particles: readonly Particle[], floor: number): Particle[] {
	return particles
		.map((p) => ({
			...p,
			x: p.x + p.vx,
			y: p.y + p.vy,
			vx: p.vx * DRAG,
			vy: p.vy * DRAG + GRAVITY,
			rotation: p.rotation + p.spin,
			life: p.life - LIFE_DECAY
		}))
		.filter((p) => p.life > 0 && p.y < floor + 20);
}

// A single shared canvas, so rapid clicks add particles instead of stacking canvases.
let canvas: HTMLCanvasElement | null = null;
let particles: Particle[] = [];
let frame = 0;

function readColors(): string[] {
	const styles = getComputedStyle(document.documentElement);
	return COLOR_TOKENS.map((token) => styles.getPropertyValue(token).trim()).filter(Boolean);
}

function draw(context: CanvasRenderingContext2D, width: number, height: number) {
	context.clearRect(0, 0, width, height);
	for (const p of particles) {
		context.save();
		context.globalAlpha = Math.min(1, p.life * 2);
		context.translate(p.x, p.y);
		context.rotate(p.rotation);
		if (p.emoji) {
			context.font = `${p.width}px sans-serif`;
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText(p.emoji, 0, 0);
		} else {
			context.fillStyle = p.color;
			context.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
		}
		context.restore();
	}
}

function tick() {
	if (!canvas) return;
	const context = canvas.getContext('2d');
	const width = window.innerWidth;
	const height = window.innerHeight;

	particles = stepParticles(particles, height);
	if (!context || particles.length === 0) {
		canvas.remove();
		canvas = null;
		frame = 0;
		return;
	}

	draw(context, width, height);
	frame = requestAnimationFrame(tick);
}

/**
 * Burst confetti from a point of the viewport (in CSS pixels).
 * Does nothing on the server or when the visitor prefers reduced motion.
 */
export function burstConfetti({
	x,
	y,
	count = 90,
	emojiRatio = 0.2
}: {
	x: number;
	y: number;
	count?: number;
	emojiRatio?: number;
}) {
	if (typeof window === 'undefined') return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const created = createParticles(x, y, count, readColors(), { emojiRatio });
	if (created.length === 0) return;
	particles = [...particles, ...created];

	if (canvas) return; // already running: the new particles join the animation

	const ratio = window.devicePixelRatio || 1;
	canvas = document.createElement('canvas');
	canvas.width = window.innerWidth * ratio;
	canvas.height = window.innerHeight * ratio;
	canvas.setAttribute('aria-hidden', 'true');
	Object.assign(canvas.style, {
		position: 'fixed',
		inset: '0',
		width: '100%',
		height: '100%',
		pointerEvents: 'none',
		zIndex: '9999'
	});
	canvas.getContext('2d')?.scale(ratio, ratio);
	document.body.append(canvas);

	cancelAnimationFrame(frame);
	frame = requestAnimationFrame(tick);
}
