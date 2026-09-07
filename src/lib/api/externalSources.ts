import type { KnowledgePanels } from './knowledgepanels';
import { createProductsApi } from './product';
import { dev } from '$app/environment';

function getExternalSourcesResponse(fetch: typeof window.fetch) {
	return createProductsApi(fetch).apiv3.client.GET('/api/v3/external_sources');
}

export type ExternalSource = NonNullable<
	NonNullable<Awaited<ReturnType<typeof getExternalSourcesResponse>>['data']>['external_sources']
>[number];

export type ExternalSourceMatchReason =
	'category' | 'country' | 'language' | 'product_type' | 'public' | 'moderator' | 'account';

export type ExternalKnowledgePanelResult = {
	knowledgePanels: KnowledgePanels;
};

export type ExternalKnowledgePanelRequest = {
	source: ExternalSource;
	matchReasons: ExternalSourceMatchReason[];
	promise: Promise<ExternalKnowledgePanelResult | null>;
};

export type ExternalKnowledgePanelBatch = {
	requests: ExternalKnowledgePanelRequest[];
};

export type ExternalSourceProductContext = {
	code: string;
	lc: string;
	cc: string;
	productType?: string;
	categories: string[];
};

type ExternalSourceProductResponse = {
	knowledge_panels?: KnowledgePanels;
	panels?: KnowledgePanels;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function matchesFilter(
	allowedValues: readonly string[] | undefined,
	contextValue: string | readonly string[] | undefined
) {
	if (allowedValues == null || allowedValues.length === 0) return true;
	if (contextValue == null) return false;

	const contextValues = Array.isArray(contextValue) ? contextValue : [contextValue];
	return contextValues.some((value) => allowedValues.includes(value));
}

/**
 * Expand the template variables documented by the Product Opener API.
 * Values are encoded individually so that a barcode or locale cannot alter
 * the provider URL structure.
 *
 * @see https://openfoodfacts.github.io/documentation/docs/Product-Opener/v3/knowledge-panels/get-api-v3-external-sources/
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

	if (!matchesFilter(filters.categories, context.categories)) {
		issues.push('categories');
	}
	if (!matchesFilter(filters.countries, context.cc)) {
		issues.push(`country:${context.cc}`);
	}
	if (!matchesFilter(filters.languages, context.lc)) {
		issues.push(`language:${context.lc}`);
	}
	if (!matchesFilter(filters.product_types, context.productType)) {
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

	if (filters?.categories?.length && matchesFilter(filters.categories, context.categories)) {
		reasons.push('category');
	}
	if (filters?.countries?.length && matchesFilter(filters.countries, context.cc)) {
		reasons.push('country');
	}
	if (filters?.languages?.length && matchesFilter(filters.languages, context.lc)) {
		reasons.push('language');
	}
	if (filters?.product_types?.length && matchesFilter(filters.product_types, context.productType)) {
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

	if (isRecord(payload.knowledge_panels)) {
		return payload.knowledge_panels as KnowledgePanels;
	}
	if (isRecord(payload.panels)) {
		return payload.panels as KnowledgePanels;
	}

	return undefined;
}

async function fetchExternalSourcePanels(
	fetch: typeof window.fetch,
	source: ExternalSource,
	context: ExternalSourceProductContext
): Promise<ExternalKnowledgePanelResult | null> {
	const url = expandExternalSourceUrl(source.knowledge_panel_url, context);
	if (dev) console.debug('[external sources] Fetching provider panels', source.id, url);
	const response = await fetch(url, {
		headers: { Accept: 'application/json' }
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
		knowledgePanels
	};
}

export async function getExternalKnowledgePanelRequests(
	fetch: typeof window.fetch,
	context: ExternalSourceProductContext
): Promise<ExternalKnowledgePanelBatch> {
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
	const requests = eligibleSources.map((source) => {
		const matchReasons = getExternalSourceMatchReasons(source, context);
		return {
			source,
			matchReasons,
			promise: fetchExternalSourcePanels(fetch, source, context)
		};
	});

	return { requests };
}

export async function getExternalKnowledgePanels(
	fetch: typeof window.fetch,
	context: ExternalSourceProductContext
): Promise<ExternalKnowledgePanelResult[]> {
	const { requests } = await getExternalKnowledgePanelRequests(fetch, context);
	const results = await Promise.allSettled(requests.map(({ promise }) => promise));

	return results.flatMap((result, index) => {
		if (result.status === 'fulfilled' && result.value != null) {
			if (dev)
				console.debug('[external sources] Provider panels loaded', requests[index].source.id);
			return [result.value];
		}
		if (result.status === 'fulfilled' && dev) {
			console.debug('[external sources] Provider returned no panels', requests[index].source.id);
		}
		if (result.status === 'rejected') {
			console.warn(`Failed to fetch external source ${requests[index].source.id}`, result.reason);
		}
		return [];
	});
}

/** Fetch the ordered external source metadata from Product Opener v3. */
export async function getExternalSources(fetch: typeof window.fetch): Promise<ExternalSource[]> {
	try {
		const { data, error } = await getExternalSourcesResponse(fetch);
		if (error != null || data == null) {
			console.warn('Failed to fetch external knowledge panel sources', error);
			return [];
		}

		const sources = data?.external_sources ?? [];
		return sources;
	} catch (error) {
		console.warn('Failed to fetch external knowledge panel sources', error);
		return [];
	}
}
