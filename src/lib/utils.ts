import { USER_AGENT } from './const';

export const wrapFetch =
	(fetch: (url: string, options?: RequestInit) => Promise<Response>) =>
	(url: string, options?: RequestInit) =>
		fetch(url, {
			...options
		});
