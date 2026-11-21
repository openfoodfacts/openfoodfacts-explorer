import { describe, expect, it } from 'vitest';
import { createParticles, FOOD_EMOJIS, stepParticles } from './confetti.js';

const COLORS = ['red', 'green', 'blue'];

describe('createParticles', () => {
	it('creates the requested number of particles at the origin, with the given colours', () => {
		const particles = createParticles(100, 200, 50, COLORS);

		expect(particles).toHaveLength(50);
		for (const particle of particles) {
			expect(particle.x).toBe(100);
			expect(particle.y).toBe(200);
			expect(COLORS).toContain(particle.color);
			expect(particle.life).toBeGreaterThan(0);
			expect(particle.life).toBeLessThanOrEqual(1);
		}
	});

	it('launches particles upwards, in a cone', () => {
		const particles = createParticles(0, 0, 200, COLORS);

		// Upwards means a negative vertical speed; the cone is a bit wider than 90°.
		const upwards = particles.filter((particle) => particle.vy < 0);
		expect(upwards.length).toBeGreaterThan(particles.length * 0.7);
	});

	it('creates nothing without colours', () => {
		expect(createParticles(0, 0, 10, [])).toEqual([]);
	});

	it('is deterministic with a fixed random source', () => {
		expect(createParticles(1, 2, 5, COLORS, { random: () => 0.5 })).toEqual(
			createParticles(1, 2, 5, COLORS, { random: () => 0.5 })
		);
	});
});

describe('food emoji', () => {
	it('makes every particle an emoji when the ratio is 1', () => {
		const particles = createParticles(0, 0, 50, COLORS, { emojiRatio: 1 });

		for (const particle of particles) {
			expect(FOOD_EMOJIS).toContain(particle.emoji);
		}
	});

	it('makes no emoji when the ratio is 0', () => {
		const particles = createParticles(0, 0, 50, COLORS, { emojiRatio: 0 });

		expect(particles.every((particle) => particle.emoji === undefined)).toBe(true);
	});

	it('mixes emoji and rectangles with a ratio in between', () => {
		const particles = createParticles(0, 0, 400, COLORS, { emojiRatio: 0.5 });
		const emoji = particles.filter((particle) => particle.emoji).length;

		expect(emoji).toBeGreaterThan(100);
		expect(emoji).toBeLessThan(300);
	});

	it('keeps the emoji while the particle moves', () => {
		const [emojiParticle] = createParticles(0, 0, 1, COLORS, { emojiRatio: 1 });
		const [next] = stepParticles([emojiParticle], 1000);

		expect(next.emoji).toBe(emojiParticle.emoji);
	});
});

describe('stepParticles', () => {
	const [particle] = createParticles(0, 0, 1, COLORS, { random: () => 0.5, emojiRatio: 0 });

	it('moves a particle and pulls it down with gravity', () => {
		const [next] = stepParticles([particle], 1000);

		expect(next.x).toBeCloseTo(particle.x + particle.vx);
		expect(next.y).toBeCloseTo(particle.y + particle.vy);
		// Gravity adds to the vertical speed, drag slows it a little.
		expect(next.vy).toBeGreaterThan(particle.vy * 0.99);
		expect(next.life).toBeLessThan(particle.life);
	});

	it('drops particles whose life is over', () => {
		expect(stepParticles([{ ...particle, life: 0.001 }], 1000)).toEqual([]);
	});

	it('drops particles that fell below the floor', () => {
		expect(stepParticles([{ ...particle, y: 5000, vy: 0 }], 1000)).toEqual([]);
	});

	it('runs out on its own after a while', () => {
		let particles = createParticles(0, 0, 40, COLORS);
		for (let frame = 0; frame < 400 && particles.length > 0; frame++) {
			particles = stepParticles(particles, 800);
		}
		expect(particles).toEqual([]);
	});
});
