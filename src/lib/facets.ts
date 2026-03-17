// Lucene supports a complex language to search for documents,
// but without implementing a full parser we cannot do much.

export type FacetsSelection = {
	[facet: string]: {
		include: string[];
		exclude: string[];
	};
};

export function toLuceneString(query: string, facets: FacetsSelection): string {
	const parts: string[] = [];
	if (query && query.length > 0) {
		parts.push(query);
	}

	// Now we create the Conjunctive Normal Form
	const orExpr = (terms: string[]) => terms.map((term) => `"${term}"`).join(' OR ');

	for (const [facet, values] of Object.entries(facets)) {
		if (values.include && values.include.length > 0) {
			parts.push(`${facet}:(${orExpr(values.include)})`);
		}
		if (values.exclude && values.exclude.length > 0) {
			parts.push(`-${facet}:(${orExpr(values.exclude)})`);
		}
	}

	return parts.join(' AND ');
}

export function extractQuery(luceneQuery: string): string {
	// split at first AND / OR / NOT
	return luceneQuery
		.split(/ AND /)
		.map((part) => part.trim())
		.filter(
			(it) =>
				it.length > 0 &&
				!['AND', 'OR', 'NOT'].includes(it) &&
				// the main query is not in 'key:value' format
				!it.includes(':')
		)
		.join(' ');
}

type FacetType = 'include' | 'exclude';

function updateFacet(
	query: FacetsSelection,
	facet: string,
	value: string,
	type: FacetType,
	action: 'add' | 'remove'
): FacetsSelection {
	const newQuery: FacetsSelection = { ...query };

	if (action === 'add') {
		if (!newQuery[facet]) {
			newQuery[facet] = { include: [], exclude: [] };
		}
		if (!newQuery[facet][type].includes(value)) {
			newQuery[facet][type].push(value);
		}
	} else if (action === 'remove') {
		if (newQuery[facet]) {
			newQuery[facet] = {
				...newQuery[facet],
				[type]: newQuery[facet][type].filter((v: string) => v !== value)
			};
		}
	}

	return newQuery;
}

export function addIncludeFacet(
	sel: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	return updateFacet(sel, facet, value, 'include', 'add');
}

export function addExcludeFacet(
	sel: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	return updateFacet(sel, facet, value, 'exclude', 'add');
}

export function removeIncludeFacet(
	query: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	return updateFacet(query, facet, value, 'include', 'remove');
}

export function removeExcludeFacet(
	query: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	return updateFacet(query, facet, value, 'exclude', 'remove');
}
