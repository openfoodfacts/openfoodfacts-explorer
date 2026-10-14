import type { FacetsSelection } from './facet-selection';
import { getSearchFieldForFacet, getFacetKeyForSearchField } from './facet-fields';

// These helpers support the facet query subset rather than the full Lucene language.
export function toLuceneString(query: string, facets: FacetsSelection): string {
	const parts: string[] = [];
	if (query && query.length > 0) {
		parts.push(query);
	}

	// Now we create the Conjunctive Normal Form
	const escapeTerm = (term: string) => term.replace(/([\\"])/g, '\\$1');
	const orExpr = (terms: string[]) => terms.map((term) => `"${escapeTerm(term)}"`).join(' OR ');

	for (const [facet, values] of Object.entries(facets)) {
		const searchField = getSearchFieldForFacet(facet);
		if (values.include && values.include.length > 0) {
			parts.push(`${searchField}:(${orExpr(values.include)})`);
		}
		if (values.exclude && values.exclude.length > 0) {
			parts.push(`-${searchField}:(${orExpr(values.exclude)})`);
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

function splitOutsideQuotes(str: string, delimiterPattern: RegExp): string[] {
	const result: string[] = [];
	let current = '';
	let inQuotes = false;
	let i = 0;

	while (i < str.length) {
		const char = str[i];
		if (char === '\\' && i + 1 < str.length) {
			current += char + str[i + 1];
			i += 2;
		} else if (char === '"') {
			inQuotes = !inQuotes;
			current += char;
			i++;
		} else if (!inQuotes) {
			const remaining = str.slice(i);
			const match = remaining.match(delimiterPattern);
			if (match && match.index === 0) {
				if (current.trim()) {
					result.push(current.trim());
				}
				current = '';
				i += match[0].length;
			} else {
				current += char;
				i++;
			}
		} else {
			current += char;
			i++;
		}
	}
	if (current.trim()) {
		result.push(current.trim());
	}
	return result;
}

export function parseLuceneFacets(luceneQuery: string): FacetsSelection {
	const sel: FacetsSelection = {};
	if (!luceneQuery) return sel;

	const parts = splitOutsideQuotes(luceneQuery, /^\s+AND\s+/i);

	for (const part of parts) {
		let trimmed = part.trim();
		if (!trimmed) continue;

		while (trimmed.startsWith('(') && trimmed.endsWith(')')) {
			trimmed = trimmed.slice(1, -1).trim();
		}

		const subParts = trimmed.includes(':') ? [trimmed] : [];
		for (const subPart of subParts) {
			const cleanSub = subPart.trim().replace(/^\(+/, '');
			const isExclude = cleanSub.startsWith('-');
			const cleanPart = isExclude ? cleanSub.slice(1) : cleanSub;

			const colonIdx = cleanPart.indexOf(':');
			if (colonIdx === -1) continue;

			const rawFacet = cleanPart.slice(0, colonIdx).trim().replace(/^\(+/, '');
			const facet = getFacetKeyForSearchField(rawFacet);
			let valExpr = cleanPart.slice(colonIdx + 1).trim();

			if (!facet || !valExpr) continue;

			while (valExpr.startsWith('(') && valExpr.endsWith(')')) {
				valExpr = valExpr.slice(1, -1).trim();
			}
			valExpr = valExpr.replace(/\)+$/, '').trim();

			const values = splitOutsideQuotes(valExpr, /^\s+OR\s+/i)
				.map((v) => {
					let s = v
						.trim()
						.replace(/^\(+|\)+$/g, '')
						.trim();
					if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
						s = s.slice(1, -1);
					}
					return s.replace(/\\([\\"])/g, '$1');
				})
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
	}

	return sel;
}
