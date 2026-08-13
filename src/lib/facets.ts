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

export function toggleIncludeFacet(
	sel: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const isCurrentlyIncluded = sel[facet]?.include?.includes(value);
	if (isCurrentlyIncluded) {
		return removeIncludeFacet(sel, facet, value);
	} else {
		const withoutExclude = removeExcludeFacet(sel, facet, value);
		return addIncludeFacet(withoutExclude, facet, value);
	}
}

export function toggleExcludeFacet(
	sel: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const isCurrentlyExcluded = sel[facet]?.exclude?.includes(value);
	if (isCurrentlyExcluded) {
		return removeExcludeFacet(sel, facet, value);
	} else {
		const withoutInclude = removeIncludeFacet(sel, facet, value);
		return addExcludeFacet(withoutInclude, facet, value);
	}
}

export function parseLuceneFacets(luceneQuery: string): FacetsSelection {
	const sel: FacetsSelection = {};
	if (!luceneQuery) return sel;

	const parts = luceneQuery.split(/\s+AND\s+/i);

	for (const part of parts) {
		const trimmed = part.trim();
		if (!trimmed) continue;

		const isExclude = trimmed.startsWith('-');
		const cleanPart = isExclude ? trimmed.slice(1) : trimmed;

		const colonIdx = cleanPart.indexOf(':');
		if (colonIdx === -1) continue;

		const facet = cleanPart.slice(0, colonIdx).trim();
		let valExpr = cleanPart.slice(colonIdx + 1).trim();

		if (!facet || !valExpr) continue;

		if (valExpr.startsWith('(') && valExpr.endsWith(')')) {
			valExpr = valExpr.slice(1, -1).trim();
		}

		const values = valExpr
			.split(/\s+OR\s+/i)
			.map((v) => v.trim().replace(/^"(.*)"$/, '$1'))
			.filter((v) => v.length > 0);

		if (!sel[facet]) {
			sel[facet] = { include: [], exclude: [] };
		}

		if (isExclude) {
			for (const val of values) {
				if (!sel[facet].exclude.includes(val)) {
					sel[facet].exclude.push(val);
				}
			}
		} else {
			for (const val of values) {
				if (!sel[facet].include.includes(val)) {
					sel[facet].include.push(val);
				}
			}
		}
	}

	return sel;
}
