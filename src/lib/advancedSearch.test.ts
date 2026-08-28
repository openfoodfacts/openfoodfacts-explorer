import { describe, it, expect } from 'vitest';
import {
	buildAdvancedLuceneQuery,
	parseAdvancedLuceneQuery,
	createEmptyCriterion,
	createDefaultIngredientToggles,
	type AdvancedCriterion,
	type IngredientTogglesState
} from './advancedSearch';

describe('buildAdvancedLuceneQuery', () => {
	it('builds query with base text and single criterion', () => {
		const criteria: AdvancedCriterion[] = [
			{
				id: '1',
				facetKey: 'brands',
				operator: 'contains',
				value: 'Nestle',
				nextConnector: 'AND'
			}
		];
		const toggles = createDefaultIngredientToggles();
		const result = buildAdvancedLuceneQuery('chocolate', criteria, toggles);
		expect(result).toBe('chocolate AND brands:("Nestle")');
	});

	it('builds query with multiple criteria and OR connector', () => {
		const criteria: AdvancedCriterion[] = [
			{
				id: '1',
				facetKey: 'brands',
				operator: 'contains',
				value: 'Coca-Cola',
				nextConnector: 'OR'
			},
			{
				id: '2',
				facetKey: 'brands',
				operator: 'contains',
				value: 'Pepsi',
				nextConnector: 'AND'
			}
		];
		const toggles = createDefaultIngredientToggles();
		const result = buildAdvancedLuceneQuery('', criteria, toggles);
		expect(result).toBe('(brands:("Coca-Cola") OR brands:("Pepsi"))');
	});

	it('builds query with exclude (does_not_contain) criteria', () => {
		const criteria: AdvancedCriterion[] = [
			{
				id: '1',
				facetKey: 'allergens',
				operator: 'does_not_contain',
				value: 'en:peanuts',
				nextConnector: 'AND'
			}
		];
		const toggles = createDefaultIngredientToggles();
		const result = buildAdvancedLuceneQuery('', criteria, toggles);
		expect(result).toBe('-allergens:("en:peanuts")');
	});

	it('builds query with ingredient class toggles', () => {
		const criteria: AdvancedCriterion[] = [];
		const toggles: IngredientTogglesState = {
			additives: 'without',
			palmOil: 'without',
			maybePalmOil: 'indifferent'
		};
		const result = buildAdvancedLuceneQuery('cookies', criteria, toggles);
		expect(result).toBe('cookies AND additives_n:0 AND ingredients_analysis:("en:palm-oil-free")');
	});

	it('builds query with with-additives and with-palm-oil toggles', () => {
		const criteria: AdvancedCriterion[] = [];
		const toggles: IngredientTogglesState = {
			additives: 'with',
			palmOil: 'with',
			maybePalmOil: 'with'
		};
		const result = buildAdvancedLuceneQuery('', criteria, toggles);
		expect(result).toBe(
			'additives_tags:* AND ingredients_analysis:("en:palm-oil") AND ingredients_analysis:("en:maybe-palm-oil")'
		);
	});
});

describe('parseAdvancedLuceneQuery', () => {
	it('parses criteria rows from simple lucene query', () => {
		const query = 'brands:("Nestle") AND categories:("en:chocolates")';
		const parsed = parseAdvancedLuceneQuery(query);
		expect(parsed.criteria.length).toBe(2);
		expect(parsed.criteria[0].facetKey).toBe('brands');
		expect(parsed.criteria[0].value).toBe('Nestle');
		expect(parsed.criteria[0].operator).toBe('contains');
		expect(parsed.criteria[1].facetKey).toBe('categories');
		expect(parsed.criteria[1].value).toBe('en:chocolates');
	});

	it('parses exclude criteria', () => {
		const query = '-allergens:("en:peanuts")';
		const parsed = parseAdvancedLuceneQuery(query);
		expect(parsed.criteria.length).toBe(1);
		expect(parsed.criteria[0].facetKey).toBe('allergens');
		expect(parsed.criteria[0].operator).toBe('does_not_contain');
		expect(parsed.criteria[0].value).toBe('en:peanuts');
	});

	it('extracts ingredient class toggles from query', () => {
		const query = 'pizza AND additives_n:0 AND ingredients_analysis:("en:palm-oil-free")';
		const parsed = parseAdvancedLuceneQuery(query);
		expect(parsed.baseTextQuery).toBe('pizza');
		expect(parsed.toggles.additives).toBe('without');
		expect(parsed.toggles.palmOil).toBe('without');
	});

	it('handles empty query gracefully', () => {
		const parsed = parseAdvancedLuceneQuery('');
		expect(parsed.baseTextQuery).toBe('');
		expect(parsed.criteria.length).toBe(1);
		expect(parsed.criteria[0].value).toBe('');
		expect(parsed.toggles.additives).toBe('indifferent');
	});
});
