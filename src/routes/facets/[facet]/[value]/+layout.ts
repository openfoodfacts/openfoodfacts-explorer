import { browser } from '$app/env';

import { getLocale } from '#lib/i18n/index.js';
import type { LayoutLoad } from './$types';
import { getHierarchy } from './hierarchy';

export const load: LayoutLoad = ({ fetch, params }) => {
	const empty = { parents: [], children: [] };
	return {
		hierarchy: browser
			? getHierarchy(fetch, params.facet, params.value, getLocale()).catch(() => empty)
			: Promise.resolve(empty)
	};
};
