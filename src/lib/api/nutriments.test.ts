import { describe, expect, it, vi } from 'vitest';
import enMessages from '../i18n/messages/en-US.json';
import frMessages from '../i18n/messages/fr.json';
import {
	flattenNutrients,
	getMissingNutrientOptions,
	getNutrients,
	getSelectableNutrients,
	type NutrientOption
} from './nutriments';

const nutrientOptions: NutrientOption[] = [
	{
		id: 'fat',
		name: 'Fat',
		unit: 'g'
	},
	{
		id: 'trans-fat',
		name: 'Trans fat',
		unit: 'g'
	}
];

describe('nutrients API', () => {
	it('flattens nutrients and sub-nutrients', () => {
		const nutrients = flattenNutrients([
			{
				...nutrientOptions[0],
				nutrients: [{ ...nutrientOptions[1], display_in_edit_form: false }]
			}
		]);

		expect(nutrients.map(({ id }) => id)).toEqual(['fat', 'trans-fat']);
		expect(nutrients[1]?.displayInEditForm).toBe(false);
	});

	it('keeps unselected nutrients available as additional options', () => {
		const options = getSelectableNutrients(nutrientOptions, new Set(), ['fat']);

		expect(options.map(({ id }) => id)).toEqual(['trans-fat']);
	});

	it('preserves persisted nutrients missing from the fallback catalog', () => {
		const missingNutrients = getMissingNutrientOptions(
			{
				caffeine: 20,
				caffeine_unit: 'mg',
				caffeine_100g: 20,
				fat: 5,
				fat_unit: 'g'
			},
			nutrientOptions
		);

		expect(missingNutrients).toEqual([{ id: 'caffeine', name: 'caffeine', unit: 'mg' }]);
	});

	it('preserves persisted nova-group with expected name "NOVA group" and empty unit', () => {
		const missingNutrients = getMissingNutrientOptions(
			{
				'nova-group': 4,
				'nova-group_100g': 4,
				'nova-group_serving': 4,
				'nova-group_unit': '',
				'nova-group_value': 4,
				fat: 30
			},
			nutrientOptions
		);

		expect(missingNutrients).toEqual([{ id: 'nova-group', name: 'NOVA group', unit: '' }]);
	});

	it('defaults unit to empty string for nova-group when unit is undefined in nutriments', () => {
		const missingNutrients = getMissingNutrientOptions(
			{
				'nova-group': 4
			},
			nutrientOptions
		);

		expect(missingNutrients).toEqual([{ id: 'nova-group', name: 'NOVA group', unit: '' }]);
	});

	it('has translations for nova-group in en-US and fr messages', () => {
		expect(enMessages.product.edit.nutrient['nova-group']).toBe('NOVA group');
		expect(frMessages.product.edit.nutrient['nova-group']).toBe('Groupe NOVA');
	});

	it('can exclude nova-group from selectable additional options', () => {
		const options = getSelectableNutrients(
			[...nutrientOptions, { id: 'nova-group', name: 'NOVA group', unit: '' }],
			new Set(['nova-group']),
			[]
		);

		expect(options.map(({ id }) => id)).toEqual(['fat', 'trans-fat']);
	});

	it('retains persisted nova-group alongside remote catalog when remote catalog loads', () => {
		const remoteNutrients: NutrientOption[] = [
			{ id: 'fat', name: 'Fat', unit: 'g' },
			{ id: 'proteins', name: 'Proteins', unit: 'g' }
		];
		const productNutriments = {
			fat: 10,
			'nova-group': 4,
			'nova-group_100g': 4,
			'nova-group_unit': ''
		};

		const combinedCatalog = [
			...remoteNutrients,
			...getMissingNutrientOptions(productNutriments, remoteNutrients)
		];

		expect(combinedCatalog).toContainEqual({ id: 'nova-group', name: 'NOVA group', unit: '' });
		expect(combinedCatalog.find((n) => n.id === 'nova-group')?.name).toBe('NOVA group');
	});

	it('loads localized nutrients through the SDK client', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					nutrients: [
						{
							id: 'fat',
							name: 'Matières grasses',
							unit: 'g',
							nutrients: [{ id: 'trans-fat', name: 'Acides gras trans', unit: 'g' }]
						}
					]
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				}
			)
		);

		const nutrients = await getNutrients(fetchMock, 'fr-FR', 'FR');

		const request = fetchMock.mock.calls[0]?.[0];
		const requestUrl = request instanceof Request ? request.url : String(request);
		expect(requestUrl).toContain('/cgi/nutrients.pl?lc=fr-fr&cc=fr');
		expect(nutrients).toEqual([
			{ id: 'fat', name: 'Matières grasses', unit: 'g' },
			{ id: 'trans-fat', name: 'Acides gras trans', unit: 'g' }
		]);
	});
});
