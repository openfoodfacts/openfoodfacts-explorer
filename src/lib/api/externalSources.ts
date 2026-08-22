import type { KnowledgePanels } from './knowledgepanels';
import { createProductsApi } from './product';
import { dev } from '$app/environment';

export type ExternalSourceFilters = {
	categories?: string[];
	countries?: string[];
	languages?: string[];
	product_types?: string[];
};

export type ExternalSource = {
	id: string;
	name: string;
	description?: string;
	icon_url?: string;
	knowledge_panel_url: string;
	provider_name?: string;
	provider_website?: string;
	privacy_policy_url?: string;
	section?: string;
	scope?: 'public' | 'users' | 'moderators' | string;
	user_in_scope?: boolean;
	filters?: ExternalSourceFilters;
};

export type ExternalSourceMatchReason =
	'category' | 'country' | 'language' | 'product_type' | 'public' | 'moderator' | 'account';

export type ExternalKnowledgePanels = ExternalSource & {
	knowledgePanels: KnowledgePanels;
	matchReasons: ExternalSourceMatchReason[];
	productName?: string;
	productImageUrl?: string;
};

export type ExternalSourceProductContext = {
	code: string;
	lc: string;
	cc: string;
	productType?: string;
	categories: string[];
};

type ExternalSourcesResponse = {
	external_sources?: ExternalSource[];
};

type ExternalSourceProductResponse = {
	name?: string;
	product_image_url?: string;
	knowledge_panels?: KnowledgePanels;
	result?: {
		knowledge_panels?: KnowledgePanels;
	};
	panels?: KnowledgePanels;
};

const EXTERNAL_SOURCE_TIMEOUT_MS = 10_000;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function matchesFilter(values: string[] | undefined, value: string | undefined, list: string[]) {
	if (values == null || values.length === 0) return true;
	if (value != null && values.includes(value)) return true;
	return list.some((item) => values.includes(item));
}

/**
 * Expand the template variables documented by the Product Opener API.
 * Values are encoded individually so that a barcode or locale cannot alter
 * the provider URL structure.
 */
export function expandExternalSourceUrl(
	template: string,
	context: Pick<ExternalSourceProductContext, 'code' | 'lc' | 'cc'>
): string {
	const values = {
		code: context.code,
		lc: context.lc,
		cc: context.cc
	};

	return template.replace(/\$(code|lc|cc)/g, (_, key: keyof typeof values) => {
		return encodeURIComponent(values[key]);
	});
}

export function isExternalSourceEligible(
	source: ExternalSource,
	context: Omit<ExternalSourceProductContext, 'code'>
): boolean {
	return getExternalSourceEligibilityIssues(source, context).length === 0;
}

export function getExternalSourceEligibilityIssues(
	source: ExternalSource,
	context: Omit<ExternalSourceProductContext, 'code'>
): string[] {
	const issues: string[] = [];

	// The API may return all configured sources. Non-public sources must only
	// be displayed when the authenticated API response explicitly grants access.
	if (source.scope != null && source.scope !== 'public' && source.user_in_scope !== true) {
		issues.push(`scope:${source.scope}`);
	}

	const filters = source.filters;
	if (filters == null) return issues;

	if (!matchesFilter(filters.categories, undefined, context.categories)) {
		issues.push('categories');
	}
	if (!matchesFilter(filters.countries, context.cc, [])) {
		issues.push(`country:${context.cc}`);
	}
	if (!matchesFilter(filters.languages, context.lc, [])) {
		issues.push(`language:${context.lc}`);
	}
	if (!matchesFilter(filters.product_types, context.productType, [])) {
		issues.push(`product_type:${context.productType ?? 'unknown'}`);
	}

	return issues;
}

export function getExternalSourceMatchReasons(
	source: ExternalSource,
	context: Omit<ExternalSourceProductContext, 'code'>
): ExternalSourceMatchReason[] {
	const reasons: ExternalSourceMatchReason[] = [];
	const filters = source.filters;

	if (
		filters?.categories?.length &&
		matchesFilter(filters.categories, undefined, context.categories)
	) {
		reasons.push('category');
	}
	if (filters?.countries?.length && matchesFilter(filters.countries, context.cc, [])) {
		reasons.push('country');
	}
	if (filters?.languages?.length && matchesFilter(filters.languages, context.lc, [])) {
		reasons.push('language');
	}
	if (
		filters?.product_types?.length &&
		matchesFilter(filters.product_types, context.productType, [])
	) {
		reasons.push('product_type');
	}

	if (source.scope === 'moderators' && source.user_in_scope === true) {
		reasons.push('moderator');
	} else if (source.scope === 'users' && source.user_in_scope === true) {
		reasons.push('account');
	} else if (source.scope == null || source.scope === 'public') {
		reasons.push('public');
	}

	return reasons;
}

function getKnowledgePanels(payload: unknown): KnowledgePanels | undefined {
	if (!isRecord(payload)) return undefined;

	const candidates = [payload, payload.result, payload.product];
	for (const candidate of candidates) {
		if (!isRecord(candidate)) continue;
		const panels = candidate.knowledge_panels ?? candidate.panels;
		if (isRecord(panels)) return panels as KnowledgePanels;
	}

	// Also accept a provider returning the knowledge-panels map directly.
	const directPanelEntries = Object.entries(payload).filter(([, value]) => isRecord(value));
	if (
		directPanelEntries.length > 0 &&
		directPanelEntries.every(([, value]) => {
			return (
				isRecord(value) && ('elements' in value || 'title_element' in value || 'type' in value)
			);
		})
	) {
		return Object.fromEntries(directPanelEntries) as KnowledgePanels;
	}

	return undefined;
}

async function fetchExternalSourcePanels(
	fetch: typeof window.fetch,
	source: ExternalSource,
	context: ExternalSourceProductContext,
	matchReasons: ExternalSourceMatchReason[]
): Promise<ExternalKnowledgePanels | null> {
	const url = expandExternalSourceUrl(source.knowledge_panel_url, context);
	if (dev) console.debug('[external sources] Fetching provider panels', source.id, url);
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), EXTERNAL_SOURCE_TIMEOUT_MS);

	try {
		const response = await fetch(url, {
			headers: { Accept: 'application/json' },
			signal: controller.signal
		});
		if (!response.ok) {
			throw new Error(`Provider returned ${response.status} ${response.statusText}`);
		}

		const payload = (await response.json()) as ExternalSourceProductResponse;
		const knowledgePanels = getKnowledgePanels(payload);
		if (knowledgePanels == null || Object.keys(knowledgePanels).length === 0) {
			return null;
		}

		return {
			...source,
			knowledgePanels,
			matchReasons,
			productName: typeof payload.name === 'string' ? payload.name : undefined,
			productImageUrl:
				typeof payload.product_image_url === 'string' ? payload.product_image_url : undefined
		};
	} finally {
		clearTimeout(timeout);
	}
}

export async function getExternalKnowledgePanels(
	fetch: typeof window.fetch,
	context: ExternalSourceProductContext
): Promise<ExternalKnowledgePanels[]> {
	const sources = await getExternalSources(fetch);
	const sourceDiagnostics = sources.map((source) => ({
		id: source.id,
		issues: getExternalSourceEligibilityIssues(source, context)
	}));
	const eligibleSources = sources.filter((source) => isExternalSourceEligible(source, context));
	if (dev) {
		console.debug('[external sources] Sources loaded', {
			count: sources.length,
			context,
			eligible: eligibleSources.map((source) => source.id),
			rejected: sourceDiagnostics.filter(({ issues }) => issues.length > 0)
		});
	}
	const results = await Promise.allSettled(
		eligibleSources.map((source) =>
			fetchExternalSourcePanels(
				fetch,
				source,
				context,
				getExternalSourceMatchReasons(source, context)
			)
		)
	);

	return results.flatMap((result, index) => {
		if (result.status === 'fulfilled' && result.value != null) {
			if (dev)
				console.debug('[external sources] Provider panels loaded', eligibleSources[index].id);
			return [result.value];
		}
		if (result.status === 'fulfilled' && dev) {
			console.debug('[external sources] Provider returned no panels', eligibleSources[index].id);
		}
		if (result.status === 'rejected') {
			console.warn(`Failed to fetch external source ${eligibleSources[index].id}`, result.reason);
		}
		return [];
	});
}

/** Fetch the ordered external source metadata from Product Opener v3. */
export async function getExternalSources(fetch: typeof window.fetch): Promise<ExternalSource[]> {
	try {
		const { data, error } = await createProductsApi(fetch).apiv3.client.GET(
			'/api/v3/external_sources'
		);
		if (error != null || data == null) {
			console.warn('Failed to fetch external knowledge panel sources', error);
			return [];
		}

		const sources = ((data as ExternalSourcesResponse).external_sources ?? []).filter(
			(source): source is ExternalSource =>
				typeof source?.id === 'string' &&
				typeof source?.name === 'string' &&
				typeof source?.knowledge_panel_url === 'string'
		);
		return sources;
	} catch (error) {
		console.warn('Failed to fetch external knowledge panel sources', error);
		return [];
	}
}
