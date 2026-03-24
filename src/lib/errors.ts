export const NETWORK_ERROR_MESSAGES = {
	FETCH_FAILED: 'fetch failed',
	ENOTFOUND: 'ENOTFOUND',
	FAILED_TO_FETCH: 'Failed to fetch',
	NETWORK_ERROR: 'NetworkError',
	ABORT_ERROR_NAME: 'AbortError',
	TIMEOUT: 'timeout'
};

export const ERROR_TYPES = {
	NETWORK_ERROR: 'network_error',
	UNEXPECTED_ERROR: 'unexpected_error'
};

export const ERROR_CODES = {
	NETWORK: 503,
	UNEXPECTED: 500
};

export function isNetworkError(err: unknown): boolean {
	return (
		err instanceof TypeError &&
		(err.message === NETWORK_ERROR_MESSAGES.FETCH_FAILED ||
			err.message.includes(NETWORK_ERROR_MESSAGES.ENOTFOUND) ||
			err.message.includes(NETWORK_ERROR_MESSAGES.FAILED_TO_FETCH) ||
			err.message.includes(NETWORK_ERROR_MESSAGES.NETWORK_ERROR) ||
			err.name === NETWORK_ERROR_MESSAGES.ABORT_ERROR_NAME ||
			err.message.includes(NETWORK_ERROR_MESSAGES.TIMEOUT))
	);
}
