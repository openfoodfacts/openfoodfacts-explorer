import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';

vi.mock('@sveltejs/kit/hooks', () => ({
	sequence:
		(...handles: Handle[]): Handle =>
		({ event, resolve }) => {
			const run = (index: number, current: RequestEvent): ReturnType<Handle> =>
				index < handles.length
					? handles[index]({ event: current, resolve: async (next) => run(index + 1, next) })
					: resolve(current);
			return run(0, event);
		}
}));
vi.mock('@sentry/sveltekit', () => ({
	sentryHandle:
		(): Handle =>
		({ event, resolve }) =>
			resolve(event),
	handleErrorWithSentry: () => () => {}
}));
const clearWindow = vi.hoisted(() => vi.fn());
vi.mock('isomorphic-dompurify', () => ({ clearWindow }));

import { handle } from './hooks.server';

const runHandle = (event: RequestEvent, resolve: () => Promise<Response>) =>
	handle({ event, resolve });

const AHREFSBOT = 'Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)';
const FIREFOX = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/114.0';

const productPage = (userAgent: string) => {
	const url = new URL('https://world.openfoodfacts.org/products/3017620422003');
	return {
		route: { id: '/products/[barcode]' },
		params: { barcode: '3017620422003' },
		url,
		request: new Request(url, { headers: { 'user-agent': userAgent } }),
		locals: {},
		isDataRequest: false,
		isSubRequest: false
	} as unknown as RequestEvent;
};

describe('handle', () => {
	beforeEach(() => clearWindow.mockClear());

	it('serves denied crawlers the NOINDEX page with the security headers', async () => {
		const resolve = vi.fn(async () => new Response('page'));
		const response = await runHandle(productPage(AHREFSBOT), resolve);

		expect(resolve).not.toHaveBeenCalled();
		expect(await response.text()).toContain('<h1>NOINDEX</h1>');
		expect(response.headers.get('x-content-type-options')).toBe('nosniff');
		expect(response.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
		expect(clearWindow).toHaveBeenCalledOnce();
	});

	it('renders pages for people with the security headers', async () => {
		const resolve = vi.fn(async () => new Response('page'));
		const response = await runHandle(productPage(FIREFOX), resolve);

		expect(resolve).toHaveBeenCalledOnce();
		expect(await response.text()).toBe('page');
		expect(response.headers.get('x-content-type-options')).toBe('nosniff');
		expect(clearWindow).toHaveBeenCalledOnce();
	});
});
