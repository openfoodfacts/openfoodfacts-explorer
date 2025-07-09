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
	const queryParts = luceneQuery
		.split(/ AND /)
		.map((part) => part.trim())
		.filter((it) => it.length > 0 && ['AND', 'OR', 'NOT'].includes(it) === false);

	// the main query is not in 'key:value' format
	return queryParts.filter((part) => !part.includes(':')).join(' ');
}

export function addIncludeFacet(
	sel: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const newQuery: FacetsSelection = { ...sel };
	if (!newQuery[facet]) {
		newQuery[facet] = { include: [], exclude: [] };
	}
	if (!newQuery[facet].include.includes(value)) {
		newQuery[facet].include.push(value);
	}
	return newQuery;
}

export function addExcludeFacet(
	sel: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const newQuery: FacetsSelection = { ...sel };
	if (!newQuery[facet]) {
		newQuery[facet] = { include: [], exclude: [] };
	}
	if (!newQuery[facet].exclude.includes(value)) {
		newQuery[facet].exclude.push(value);
	}
	return newQuery;
}

export function removeIncludeFacet(
	query: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const newQuery: FacetsSelection = { ...query };
	if (newQuery[facet]) {
		newQuery[facet] = {
			...newQuery[facet],
			include: newQuery[facet].include.filter((v: string) => v !== value)
		};
	}
	return newQuery;
}

export function removeExcludeFacet(
	query: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const newQuery: FacetsSelection = { ...query };
	if (newQuery[facet]) {
		newQuery[facet] = {
			...newQuery[facet],
			exclude: newQuery[facet].exclude.filter((v: string) => v !== value)
		};
	}
	return newQuery;
}
