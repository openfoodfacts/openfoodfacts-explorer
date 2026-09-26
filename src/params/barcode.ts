import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
	return /^\d{8}$|^\d{12,14}$/.test(param);
};
