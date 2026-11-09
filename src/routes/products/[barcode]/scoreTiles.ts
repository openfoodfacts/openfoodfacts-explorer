import type { WebsiteFlavor } from '#lib/flavor.js';

/** Attribute IDs to highlight for each Open Facts product flavor, in display order. */
export const SCORE_TILE_IDS: Record<WebsiteFlavor, readonly string[]> = {
	food: ['nutriscore', 'nova', 'ecoscore'],
	beauty: [],
	petfood: [],
	product: []
};
