import { describe, expect, it, vi } from 'vitest';
import { getProductHistoryPanels, mergeHistoryPanels } from './product';
import type { KnowledgePanels } from './knowledgepanels';

const respond = (panels: object) =>
	vi.fn(
		async () =>
			new Response(JSON.stringify({ status: 'success', product: { knowledge_panels: panels } }))
	);

describe('getProductHistoryPanels', () => {
	it('requests only the contribution card with the history panel enabled', async () => {
		const fetch = respond({});
		await getProductHistoryPanels(fetch as unknown as typeof window.fetch, '123', 'en');
		const input = (fetch.mock.calls[0] as unknown[])[0];
		const url = new URL(input instanceof Request ? input.url : String(input), 'http://localhost');
		expect(url.searchParams.get('activate_knowledge_panel_product_history')).toBe('1');
		expect(url.searchParams.get('knowledge_panels_included')).toBe('contribution_card');
		expect(url.searchParams.get('fields')).toBe('knowledge_panels');
	});

	it('returns the whole contribution response when it has the history panel', async () => {
		const fetch = respond({
			root: {},
			contribution_card: { id: 1 },
			product_history: { id: 2 },
			data_quality_info: {}
		});
		const panels = await getProductHistoryPanels(
			fetch as unknown as typeof window.fetch,
			'123',
			'en'
		);
		expect(Object.keys(panels).sort()).toEqual([
			'contribution_card',
			'data_quality_info',
			'product_history',
			'root'
		]);
	});

	it('returns nothing without a history panel or on failure', async () => {
		const none = respond({ contribution_card: {} });
		expect(
			await getProductHistoryPanels(none as unknown as typeof window.fetch, '1', 'en')
		).toEqual({});
		const bad = vi.fn(async () => Promise.reject(new Error('down')));
		expect(await getProductHistoryPanels(bad as unknown as typeof window.fetch, '1', 'en')).toEqual(
			{}
		);
	});
});

describe('mergeHistoryPanels', () => {
	const ref = (panel_id: string) => ({ element_type: 'panel', panel_element: { panel_id } });
	const page = {
		root: { elements: [ref('health_card'), ref('product_card')] },
		health_card: {}
	} as unknown as KnowledgePanels;
	const history = {
		root: { elements: [ref('contribution_card')] },
		contribution_card: { id: 'with-history' },
		product_history: {}
	} as unknown as KnowledgePanels;
	const ids = (panels: KnowledgePanels) =>
		(panels.root?.elements as unknown as ReturnType<typeof ref>[]).map(
			(e) => e.panel_element.panel_id
		);

	it('inserts the contribution card before the product card', () => {
		const merged = mergeHistoryPanels(page, { code: '1', panels: history }, '1');
		expect(ids(merged)).toEqual(['health_card', 'contribution_card', 'product_card']);
		expect(merged.product_history).toBeDefined();
	});

	it('lists the contribution card once when the page root already has it', () => {
		const withCard = {
			...page,
			root: { elements: [ref('health_card'), ref('contribution_card'), ref('product_card')] }
		} as unknown as KnowledgePanels;
		const merged = mergeHistoryPanels(withCard, { code: '1', panels: history }, '1');
		expect(ids(merged)).toEqual(['health_card', 'contribution_card', 'product_card']);
		expect(merged.contribution_card).toEqual({ id: 'with-history' });
	});

	it('leaves the page panels unchanged without history', () => {
		expect(mergeHistoryPanels(page, null, '1')).toBe(page);
		expect(mergeHistoryPanels(page, { code: '1', panels: {} }, '1')).toBe(page);
	});

	it('ignores history fetched for another product', () => {
		expect(mergeHistoryPanels(page, { code: '1', panels: history }, '2')).toBe(page);
	});
});
