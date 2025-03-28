import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		title: 'Compare Products',
		description: 'Compare nutritional information of food products'
	};
};
