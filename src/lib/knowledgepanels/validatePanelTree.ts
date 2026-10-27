import type { KnowledgeElement, KnowledgePanels } from '#lib/api.js';

export const MAX_RENDERED_PANELS = 1000;

export type PanelTreeValidation =
	{ valid: true } | { valid: false; reason: 'cycle' | 'limit'; panelId: string };

/**
 * Validate the panel references reachable from the roots that will be rendered.
 * Repeated references count as separate panel instances; only the active path is
 * tracked for cycle detection.
 */
export function validatePanelTree(panels: KnowledgePanels, rootIds: string[]): PanelTreeValidation {
	let renderedPanels = 0;
	const missingPanels = new Set<string>();

	function visitElements(elements: KnowledgeElement[], path: string[]): PanelTreeValidation {
		for (const element of elements) {
			if (element.element_type === 'panel') {
				const result = visitPanel(element.panel_element.panel_id, path);
				if (!result.valid) return result;
			} else if (element.element_type === 'panel_group') {
				for (const id of element.panel_group_element.panel_ids) {
					const result = visitPanel(id, path);
					if (!result.valid) return result;
				}
			}
		}
		return { valid: true };
	}

	function visitPanel(id: string, path: string[], isRoot = false): PanelTreeValidation {
		if (path.indexOf(id) !== -1) return { valid: false, reason: 'cycle', panelId: id };

		renderedPanels += 1;
		if (renderedPanels > MAX_RENDERED_PANELS) {
			return { valid: false, reason: 'limit', panelId: id };
		}

		const panel = panels[id];
		if (panel == null) {
			if (!missingPanels.has(id)) {
				missingPanels.add(id);
				console.error('[knowledge-panels] Missing panel reference.', { panelId: id });
			}
			return { valid: true };
		}

		const childPath = path.concat(id);
		const rendersElements = isRoot || panel.type === 'inline' || panel.title_element != null;
		return rendersElements ? visitElements(panel.elements ?? [], childPath) : { valid: true };
	}

	for (const id of rootIds) {
		const result = visitPanel(id, [], true);
		if (!result.valid) return result;
	}

	return { valid: true };
}
