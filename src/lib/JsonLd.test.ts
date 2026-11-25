import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import JsonLd from './JsonLd.svelte';

const jsonLdScript = /<script type="application\/ld\+json">(.+)<\/script>/;

describe('JsonLd', () => {
	it.each([
		['Product', 'Chocolate spread'],
		['Organization', 'Open Food Facts']
	])('renders %s data in the head with the Schema.org context', (type, name) => {
		const { head, body } = render(JsonLd, { props: { type, data: { name } } });
		const json = jsonLdScript.exec(head)?.[1] ?? '';

		expect(JSON.parse(json)).toEqual({ '@context': 'https://schema.org', '@type': type, name });
		expect(body).not.toContain('application/ld+json');
	});

	it('accepts a custom linked-data context', () => {
		const context = { '@vocab': 'http://xmlns.com/foaf/0.1/' };
		const { head } = render(JsonLd, {
			props: { context, type: 'Person', data: { name: 'Alice' } }
		});
		const json = jsonLdScript.exec(head)?.[1] ?? '';

		expect(JSON.parse(json)).toEqual({ '@context': context, '@type': 'Person', name: 'Alice' });
	});

	it('preserves text without allowing markup in the script body', () => {
		const name = 'A & B "</ScRiPt><example>"';
		const { head } = render(JsonLd, { props: { type: 'Product', data: { name } } });
		const json = jsonLdScript.exec(head)?.[1] ?? '';

		expect(json).not.toContain('<');
		expect(JSON.parse(json).name).toBe(name);
	});
});
