import { describe, expect, it, vi } from 'vitest';
import type { KnowledgePanels } from '#lib/api.js';
import { MAX_RENDERED_PANELS, validatePanelTree } from './validatePanelTree';

const reference = (panel_id: string) => ({ element_type: 'panel', panel_element: { panel_id } });

const panelSet = (panels: object) => panels as KnowledgePanels;

function repeatedReferences(count: number) {
	const elements = [];
	for (let i = 0; i < count; i += 1) elements.push(reference('leaf'));
	return elements;
}

describe('validatePanelTree', () => {
	it('accepts acyclic panel references and panel groups', () => {
		const panels = panelSet({
			root: {
				type: 'inline',
				elements: [
					reference('child'),
					{
						element_type: 'panel_group',
						panel_group_element: { panel_ids: ['group-child'] }
					}
				]
			},
			child: { type: 'inline', elements: [] },
			'group-child': { type: 'inline', elements: [] }
		});

		expect(validatePanelTree(panels, ['root'])).toEqual({ valid: true });
	});

	it('rejects a reference cycle', () => {
		const panels = panelSet({
			root: { type: 'inline', elements: [reference('child')] },
			child: { type: 'inline', elements: [reference('root')] }
		});

		expect(validatePanelTree(panels, ['root'])).toEqual({
			valid: false,
			reason: 'cycle',
			panelId: 'root'
		});
	});

	it('logs missing references and continues validating siblings', () => {
		using consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		const panels = panelSet({
			root: {
				type: 'inline',
				elements: [reference('missing'), reference('missing'), reference('child')]
			},
			child: { type: 'inline', elements: [] }
		});

		expect(validatePanelTree(panels, ['root'])).toEqual({ valid: true });
		expect(consoleError).toHaveBeenCalledExactlyOnceWith(
			'[knowledge-panels] Missing panel reference.',
			{ panelId: 'missing' }
		);

		const cyclicPanels = panelSet({
			...panels,
			child: { type: 'inline', elements: [reference('root')] }
		});
		expect(validatePanelTree(cyclicPanels, ['root'])).toEqual({
			valid: false,
			reason: 'cycle',
			panelId: 'root'
		});
	});

	it('counts repeated references against one total budget', () => {
		const allowedRepeatedReferences = panelSet({
			root: {
				type: 'inline',
				elements: repeatedReferences(MAX_RENDERED_PANELS - 1)
			},
			leaf: { type: 'inline', elements: [] }
		});
		const overBudgetRepeatedReferences = panelSet({
			root: {
				type: 'inline',
				elements: repeatedReferences(MAX_RENDERED_PANELS)
			},
			leaf: { type: 'inline', elements: [] }
		});

		expect(validatePanelTree(allowedRepeatedReferences, ['root'])).toEqual({ valid: true });
		expect(validatePanelTree(overBudgetRepeatedReferences, ['root'])).toEqual({
			valid: false,
			reason: 'limit',
			panelId: 'leaf'
		});
	});
});
