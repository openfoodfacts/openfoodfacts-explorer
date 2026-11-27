import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'svelte/server';
import { writable } from 'svelte/store';
import type { PriceFull } from '@openfoodfacts/openfoodfacts-nodejs';
import { addMessages, init, locale } from 'svelte-i18n';
import messages from '#lib/i18n/messages/en-US.json';
import simplifiedChinese from '#lib/i18n/messages/zh-CN.json';
import traditionalChinese from '#lib/i18n/messages/zh-TW.json';
import hongKongChinese from '#lib/i18n/messages/zh-HK.json';

vi.mock('#lib/i18n/index.js', async () => await import('svelte-i18n'));
vi.mock('#lib/stores/user.js', () => ({ userInfo: writable(null) }));
const paths = vi.hoisted(() => ({ relative: false }));
vi.mock('$app/state', () => ({
	page: { url: new URL('https://example.test/explorer/products/7622210449283') }
}));
vi.mock('$app/paths', () => ({
	resolve: (path: string, params?: { barcode: string }) =>
		(paths.relative ? '..' : '/explorer') + path.replace('[barcode]', params?.barcode ?? '')
}));

import Prices from './Prices.svelte';
import { userInfo } from '#lib/stores/user.js';

const barcode = '7622210449283';
const editUrl = `/explorer/products/${barcode}/edit#basic-info`;
const price = { id: 1, location_id: 123, price: 2.5, currency: 'EUR' } as PriceFull;
const nudge = messages.product.prices.quantity_nudge;
const userStore = userInfo as ReturnType<
	typeof writable<{ preferred_username: string; email: string } | null>
>;

beforeEach(async () => {
	userStore.set(null);
	paths.relative = false;
	addMessages('en-US', messages);
	await init({ fallbackLocale: 'en-US', initialLocale: 'en-US' });
});

describe('Prices quantity nudge', () => {
	for (const prices of [[], [price]]) {
		it(`shows the benefit and login return target with ${prices.length} prices`, () => {
			const { body } = render(Prices, {
				props: { barcode, prices, states: ['en:quantity-to-be-completed'] }
			});
			expect(body).toContain(nudge);
			const links = [...body.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map(([link]) => link);
			const quantityLinks = links.filter((link) => link.includes(nudge));
			expect(quantityLinks).toHaveLength(1);
			expect(quantityLinks[0]).toContain(
				`href="/explorer/loginrequired?redirect=${encodeURIComponent(editUrl)}"`
			);
			expect(body).not.toContain('Add quantity');
			expect(body).toContain(`/explorer/loginrequired?redirect=${encodeURIComponent(editUrl)}`);
		});

		for (const states of [
			undefined,
			[],
			['en:quantity-completed'],
			['en:ingredients-to-be-completed']
		]) {
			it(`does not nudge for ${JSON.stringify(states)} with ${prices.length} prices`, () => {
				const { body } = render(Prices, { props: { barcode, prices, states } });
				expect(body).not.toContain(nudge);
				expect(body).not.toContain('Add quantity');
			});
		}
	}

	it('preserves an absolute login return target when SvelteKit resolves relative paths', () => {
		paths.relative = true;
		const { body } = render(Prices, {
			props: { barcode, prices: [], states: ['en:quantity-to-be-completed'] }
		});
		expect(body).toContain(`../loginrequired?redirect=${encodeURIComponent(editUrl)}`);
	});

	it('links signed-in users directly to Basic information', () => {
		userStore.set({ preferred_username: 'local-test', email: '' });
		const { body } = render(Prices, {
			props: { barcode, prices: [], states: ['en:quantity-to-be-completed'] }
		});
		expect(body).toContain(`href="${editUrl}"`);
		expect(body).not.toContain('/loginrequired');
	});
});

describe('quantity nudge language changes', () => {
	for (const [code, translations] of [
		['zh-CN', simplifiedChinese],
		['zh-TW', traditionalChinese],
		['zh-HK', hongKongChinese]
	] as const) {
		it(`uses ${code} after switching locale and preserves the edit target`, () => {
			const props = { barcode, prices: [], states: ['en:quantity-to-be-completed'] };
			expect(render(Prices, { props }).body).toContain(nudge);
			addMessages(code, translations);
			locale.set(code);
			const { body } = render(Prices, { props });
			expect(body).toContain(translations.product.prices.quantity_nudge);
			expect(body).not.toContain(nudge);
			expect(body).toContain(`/explorer/loginrequired?redirect=${encodeURIComponent(editUrl)}`);
			expect(
				render(Prices, { props: { ...props, states: ['en:quantity-completed'] } }).body
			).not.toContain(translations.product.prices.quantity_nudge);
			locale.set('en-US');
			expect(render(Prices, { props }).body).toContain(nudge);
		});
	}

	it('retains the English fallback for an untranslated locale', () => {
		addMessages('zxx', {});
		locale.set('zxx');
		const { body } = render(Prices, {
			props: { barcode, prices: [], states: ['en:quantity-to-be-completed'] }
		});
		expect(body).toContain(nudge);
		expect(body).not.toContain('product.prices.quantity_nudge');
	});
});
