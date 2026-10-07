const pending = new Set<Promise<void>>();

/**
 * Keeps track of a page data refresh (e.g. `invalidateAll()`), so that code depending
 * on up-to-date page data can wait for it with {@link waitForPendingRefreshes}.
 */
export function trackRefresh(refresh: Promise<void>): Promise<void> {
	const tracked: Promise<void> = refresh.finally(() => pending.delete(tracked));
	pending.add(tracked);
	return tracked;
}

/** Resolves once all tracked refreshes, including ones started meanwhile, have settled. */
export async function waitForPendingRefreshes(): Promise<void> {
	while (pending.size > 0) {
		await Promise.allSettled([...pending]);
	}
}
