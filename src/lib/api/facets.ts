// TODO: move this to SDK

import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

import { API_HOST, STATIC_HOST } from '$lib/const';
import type { KnowledgePanel } from './knowledgepanels';

export type FacetResponse = {
	count: number;
	tags: { id: string; known: number; name: string; products: number }[];
};

export async function getFacet(
	fetch: typeof window.fetch,
	facet: string,
	opts?: { page?: number; page_size?: number }
) {
	const params = new URLSearchParams();
	if (opts?.page) params.set('page', `${opts.page}`);
	if (opts?.page_size) params.set('page_size', `${opts.page_size}`);

	const res = await fetch(`${API_HOST}/facets/${facet}.json?${params}`);
	return (await res.json()) as FacetResponse;
}

export type FacetValueResponse = {
	count: number;
	page: number;
	page_count: number;
	page_size: number;
	products: Product[];
};

export async function getFacetValue(
	fetch: typeof window.fetch,
	facet: string,
	value: string,
	opts: { page?: number; page_size?: number }
) {
	const params = new URLSearchParams();
	if (opts?.page) params.set('page', `${opts.page}`);
	if (opts?.page_size) params.set('page_size', `${opts.page_size}`);

	const res = await fetch(`${STATIC_HOST}/facets/${facet}/${value}.json?${params}`);
	return (await res.json()) as FacetValueResponse;
}

const FACETS_KP_HOST = 'https://facets-kp.openfoodfacts.org';

export type FacetKnowledgePanelResponse = {
	knowledge_panels: Record<string, KnowledgePanel>;
};

export async function getFacetKnowledgePanels(
	fetch: typeof window.fetch,
	facet: string,
	value?: string
) {
	const params = new URLSearchParams({
		facet_tag: facet
	});
	if (value) {
		params.set('value_tag', value);
	}

	const response = await fetch(`${FACETS_KP_HOST}/knowledge_panel?${params}`);
	return (await response.json()) as FacetKnowledgePanelResponse;
}
