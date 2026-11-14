import { beforeEach, describe, expect, it, vi } from 'vitest';
import { writable } from 'svelte/store';

const { getProductV3, getTaxo } = vi.hoisted(() => ({
	getProductV3: vi.fn(),
	getTaxo: vi.fn().mockResolvedValue({})
}));

vi.mock('#lib/api.js', () => ({ createProductsApi: () => ({ getProductV3 }), getTaxo }));
vi.mock('#lib/settings.js', () => ({
	preferences: writable({ locale: 'en-US', country: 'world' }),
	getLanguageCode: () => 'en'
}));
vi.mock('#lib/stores/user.js', () => ({ userInfo: writable(null) }));
vi.mock('$app/env', () => ({ dev: true }));

import { load } from './+page';

describe('product edit loader', () => {
	beforeEach(() => {
		vi.stubGlobal('window', {});
		getProductV3.mockReset();
		getTaxo.mockClear();
	});

	const event = { fetch, params: { barcode: '123' }, url: new URL('https://example.com/') };

	it('rejects a product belonging to another database', async () => {
		getProductV3.mockResolvedValue({
			error: { result: { id: 'product_found_with_a_different_product_type' } }
		});
		await expect(load(event as never)).rejects.toMatchObject({ status: 403 });
		expect(getTaxo).not.toHaveBeenCalled();
	});

	it('loads food products', async () => {
		const state = { status: 'success', product: { product_type: 'food' } };
		getProductV3.mockResolvedValue({ data: state });
		await expect(load(event as never)).resolves.toMatchObject({ state });
	});

	it('still allows creating an unknown food product', async () => {
		getProductV3.mockResolvedValue({ error: { result: { id: 'product_not_found' } } });
		await expect(load(event as never)).resolves.toMatchObject({ state: { product: null } });
	});

	it('rejects a non-food product even if the API returns it successfully', async () => {
		getProductV3.mockResolvedValue({
			data: { status: 'success', product: { product_type: 'beauty' } }
		});
		await expect(load(event as never)).rejects.toMatchObject({ status: 403 });
	});
});
