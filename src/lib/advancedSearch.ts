import {
	MASTER_FACET_CATALOG,
	getSearchFieldForFacet,
	getFacetKeyForSearchField,
	type FacetsSelection
} from './facets';

export type LogicalConnector = 'AND' | 'OR';
export type CriteriaOperator = 'contains' | 'does_not_contain';
export type TriStateToggle = 'without' | 'with' | 'indifferent';

export interface AdvancedCriterion {
	id: string;
	facetKey: string;
	operator: CriteriaOperator;
	value: string;
	nextConnector: LogicalConnector;
}

export interface IngredientTogglesState {
	additives: TriStateToggle;
	palmOil: TriStateToggle;
	maybePalmOil: TriStateToggle;
}

export function createEmptyCriterion(
	id: string = Math.random().toString(36).substring(2, 9),
	facetKey: string = 'brands',
	nextConnector: LogicalConnector = 'AND'
): AdvancedCriterion {
	return {
		id,
		facetKey,
		operator: 'contains',
		value: '',
		nextConnector
	};
}

export function createDefaultIngredientToggles(): IngredientTogglesState {
	return {
		additives: 'indifferent',
		palmOil: 'indifferent',
		maybePalmOil: 'indifferent'
	};
}

/**
 * Builds a valid Lucene query string from advanced criteria rows and ingredient toggles.
 */
export function buildAdvancedLuceneQuery(
	baseTextQuery: string,
	criteria: AdvancedCriterion[],
	toggles: IngredientTogglesState
): string {
	const parts: string[] = [];

	if (baseTextQuery && baseTextQuery.trim().length > 0) {
		parts.push(baseTextQuery.trim());
	}

	// 1. Process criteria rows with their connectors
	const validCriteria = criteria.filter((c) => c.value && c.value.trim().length > 0);

	if (validCriteria.length > 0) {
		let criteriaClause = '';
		let hasOr = false;
		for (let i = 0; i < validCriteria.length; i++) {
			const item = validCriteria[i];
			const searchField = getSearchFieldForFacet(item.facetKey);
			const prefix = item.operator === 'does_not_contain' ? '-' : '';
			const termClause = `${prefix}${searchField}:("${item.value.trim()}")`;

			if (i === 0) {
				criteriaClause = termClause;
			} else {
				const prevConnector = validCriteria[i - 1].nextConnector || 'AND';
				if (prevConnector === 'OR') hasOr = true;
				criteriaClause += ` ${prevConnector} ${termClause}`;
			}
		}

		if (criteriaClause) {
			parts.push(hasOr && validCriteria.length > 1 ? `(${criteriaClause})` : criteriaClause);
		}
	}

	// 2. Process Ingredient Class Toggles
	if (toggles.additives === 'without') {
		parts.push('additives_n:0');
	} else if (toggles.additives === 'with') {
		parts.push('additives_tags:*');
	}

	if (toggles.palmOil === 'without') {
		parts.push('ingredients_analysis:("en:palm-oil-free")');
	} else if (toggles.palmOil === 'with') {
		parts.push('ingredients_analysis:("en:palm-oil")');
	}

	if (toggles.maybePalmOil === 'without') {
		parts.push('-ingredients_analysis:("en:maybe-palm-oil")');
	} else if (toggles.maybePalmOil === 'with') {
		parts.push('ingredients_analysis:("en:maybe-palm-oil")');
	}

	return parts.join(' AND ');
}

/**
 * Extracts advanced criteria and ingredient toggle states from an existing Lucene query.
 */
export function parseAdvancedLuceneQuery(luceneQuery: string): {
	baseTextQuery: string;
	criteria: AdvancedCriterion[];
	toggles: IngredientTogglesState;
} {
	const toggles = createDefaultIngredientToggles();
	const criteria: AdvancedCriterion[] = [];
	let query = luceneQuery ? luceneQuery.trim() : '';

	if (!query) {
		return {
			baseTextQuery: '',
			criteria: [createEmptyCriterion()],
			toggles
		};
	}

	// Extract Additives toggle
	if (query.includes('additives_n:0')) {
		toggles.additives = 'without';
		query = query.replace(/\badditives_n:0\b/g, '').trim();
	} else if (query.includes('additives_tags:*')) {
		toggles.additives = 'with';
		query = query.replace(/\badditives_tags:\*\b/g, '').trim();
	}

	// Extract Palm Oil toggle
	if (query.includes('ingredients_analysis:("en:palm-oil-free")')) {
		toggles.palmOil = 'without';
		query = query.replace(/ingredients_analysis:\("en:palm-oil-free"\)/g, '').trim();
	} else if (query.includes('ingredients_analysis:("en:palm-oil")')) {
		toggles.palmOil = 'with';
		query = query.replace(/ingredients_analysis:\("en:palm-oil"\)/g, '').trim();
	}

	// Extract Maybe Palm Oil toggle
	if (query.includes('-ingredients_analysis:("en:maybe-palm-oil")')) {
		toggles.maybePalmOil = 'without';
		query = query.replace(/-ingredients_analysis:\("en:maybe-palm-oil"\)/g, '').trim();
	} else if (query.includes('ingredients_analysis:("en:maybe-palm-oil")')) {
		toggles.maybePalmOil = 'with';
		query = query.replace(/ingredients_analysis:\("en:maybe-palm-oil"\)/g, '').trim();
	}

	// Clean up dangling AND operators caused by toggle extraction
	query = query
		.replace(/^\s*AND\s+/i, '')
		.replace(/\s+AND\s*$/i, '')
		.replace(/\s+AND\s+AND\s+/gi, ' AND ')
		.trim();

	// Extract individual criteria clauses
	const clauseRegex = /(-?)([a-zA-Z0-9_.]+):\(([^)]+)\)/g;
	let match: RegExpExecArray | null;
	const matches: {
		isExclude: boolean;
		field: string;
		valuesStr: string;
		index: number;
		full: string;
	}[] = [];

	while ((match = clauseRegex.exec(query)) !== null) {
		matches.push({
			isExclude: match[1] === '-',
			field: match[2],
			valuesStr: match[3],
			index: match.index,
			full: match[0]
		});
	}

	// Convert matches to criteria rows
	for (let i = 0; i < matches.length; i++) {
		const m = matches[i];
		const facetKey = getFacetKeyForSearchField(m.field);
		const operator: CriteriaOperator = m.isExclude ? 'does_not_contain' : 'contains';

		// Determine connector to next match (default to AND)
		let nextConnector: LogicalConnector = 'AND';
		if (i < matches.length - 1) {
			const textBetween = query.substring(m.index + m.full.length, matches[i + 1].index);
			if (/\bOR\b/i.test(textBetween)) {
				nextConnector = 'OR';
			}
		}

		// Split OR terms within the value string if any (e.g. "Coca-Cola" OR "Pepsi")
		const termMatches = m.valuesStr.match(/"([^"]+)"/g) || [m.valuesStr];
		for (let j = 0; j < termMatches.length; j++) {
			const term = termMatches[j].replace(/^"|"$/g, '');
			criteria.push({
				id: Math.random().toString(36).substring(2, 9),
				facetKey,
				operator,
				value: term,
				nextConnector: j < termMatches.length - 1 ? 'OR' : nextConnector
			});
		}
	}

	// Extract free text query
	let baseTextQuery = query;
	for (const m of matches) {
		baseTextQuery = baseTextQuery.replace(m.full, '');
	}
	baseTextQuery = baseTextQuery
		.replace(/[()]/g, '')
		.replace(/\b(AND|OR|NOT)\b/g, '')
		.replace(/\s+/g, ' ')
		.trim();

	if (criteria.length === 0) {
		criteria.push(createEmptyCriterion());
	}

	return {
		baseTextQuery,
		criteria,
		toggles
	};
}
