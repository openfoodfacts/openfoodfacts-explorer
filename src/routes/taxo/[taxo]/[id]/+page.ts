import type { PageLoad } from './$types';
import type { Category } from '$lib/taxo';
import { preferences } from '$lib/settings';
import { get } from 'svelte/store';

export const ssr = false;

export const load = (async ({ params, fetch }) => {
	const { id, taxo } = params;

	const searchParams = new URLSearchParams({
		tagtype: taxo,
		tags: id,
		lc: get(preferences).lang
	});

	const res = await fetch(
		'https://world.openfoodfacts.org/api/v2/taxonomy?' + searchParams.toString()
	);
	const element = (await res.json())[id] as Category;

	// Ask for parent and children categories

	const parentCategories = element.parents ?? [];
	const childrenCategories = element.children ?? [];

	const relatedIds = [...parentCategories, ...childrenCategories];

	const relatedSearchParams = new URLSearchParams({
		tagtype: taxo,
		tags: relatedIds.join(','),
		lc: get(preferences).lang
	});

	const relatedRes = await fetch(
		'https://world.openfoodfacts.org/api/v2/taxonomy?' + relatedSearchParams.toString()
	);
	const relatedData = (await relatedRes.json()) as Record<string, Category>;

	return {
		taxonomy: taxo,
		taxonomyElement: element,
		relatedData: relatedData
	};
}) satisfies PageLoad;
