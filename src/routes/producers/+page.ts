import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return {
		title: 'Guide for Producers',
		description:
			'Learn how to add your product photos and data directly to the Open Food Facts database as a producer.'
	};
};
