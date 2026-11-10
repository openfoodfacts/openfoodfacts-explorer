import { getPreference, type UserPreference } from '#lib/stores/preferencesStore.js';

type Attribute = { id?: string; status?: string; match?: number };

/** Select preferred non-tile attributes, putting mandatory and mismatching attributes first.
 * Unknown attributes follow known attributes of the same preference priority.
 */
export function getVisibleAttributes<T extends Attribute>(
	groups: { id: string; attributes: T[] }[],
	preferences: UserPreference[],
	excludedIds: readonly string[]
): T[] {
	function preferenceFor(attribute: T) {
		const group = groups.find((item) => item.attributes.includes(attribute));
		return group && attribute.id ? getPreference(preferences, group.id, attribute.id) : undefined;
	}

	const attributes = groups.flatMap((group) =>
		group.attributes.filter((attribute) => {
			if (!attribute.id) return false;
			if (
				excludedIds.includes(attribute.id) &&
				!(attribute.status === 'known' && attribute.match != null && attribute.match <= 10)
			)
				return false;
			const preference = getPreference(preferences, group.id, attribute.id);
			return preference?.type === 'attribute' && preference.value !== 'not_important';
		})
	);

	function priority(attribute: T): number {
		if (attribute.status === 'unknown') return 2;
		if (attribute.status === 'known' && attribute.match != null && attribute.match <= 10) return 0;
		return 1;
	}

	return attributes.toSorted((a, b) => {
		const aPref = preferenceFor(a);
		const bPref = preferenceFor(b);
		const aMandatory = aPref?.type === 'attribute' && aPref.value === 'mandatory';
		const bMandatory = bPref?.type === 'attribute' && bPref.value === 'mandatory';
		return Number(bMandatory) - Number(aMandatory) || priority(a) - priority(b);
	});
}
