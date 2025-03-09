export const wrapFetch =
	(fetch: (url: string, options?: RequestInit) => Promise<Response>) =>
	(url: string, options?: RequestInit) =>
		fetch(url, { ...options });

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
