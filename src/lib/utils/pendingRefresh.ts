const pending = new Set<Promise<unknown>>();

/**
 * Keeps track of an operation that refreshes page data (e.g. an image request followed by
 * `invalidateAll()`), so that code depending on up-to-date page data can wait for it with
 * {@link waitForPendingRefreshes}. Track the whole operation, starting before its request,
 * so that there is no gap before the refresh starts.
 */
export function trackRefresh<T>(operation: Promise<T>): Promise<T> {
	const tracked: Promise<T> = operation.finally(() => pending.delete(tracked));
	pending.add(tracked);
	return tracked;
}

/** Resolves once all tracked refreshes, including ones started meanwhile, have settled. */
export async function waitForPendingRefreshes(): Promise<void> {
	while (pending.size > 0) {
		await Promise.allSettled([...pending]);
		// Let the code awaiting these operations run first, as it may start a follow-up refresh
		await new Promise((resolve) => setTimeout(resolve, 0));
	}
}
