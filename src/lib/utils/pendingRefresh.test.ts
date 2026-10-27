import { describe, expect, it } from 'vitest';

import { trackRefresh, waitForPendingRefreshes } from './pendingRefresh';

function deferred() {
	let resolve!: () => void;
	let reject!: (error: Error) => void;
	const promise = new Promise<void>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

describe('waitForPendingRefreshes', () => {
	it('resolves immediately when nothing is pending', async () => {
		await expect(waitForPendingRefreshes()).resolves.toBeUndefined();
	});

	it('waits for a tracked refresh to finish', async () => {
		const refresh = deferred();
		trackRefresh(refresh.promise);

		let done = false;
		const waiting = waitForPendingRefreshes().then(() => (done = true));
		await Promise.resolve();
		expect(done).toBe(false);

		refresh.resolve();
		await waiting;
		expect(done).toBe(true);
	});

	it('also waits for refreshes started while waiting', async () => {
		const first = deferred();
		const second = deferred();
		trackRefresh(first.promise);

		let done = false;
		const waiting = waitForPendingRefreshes().then(() => (done = true));
		trackRefresh(second.promise);
		first.resolve();
		await new Promise((r) => setTimeout(r, 0));
		expect(done).toBe(false);

		second.resolve();
		await waiting;
		expect(done).toBe(true);
	});

	it('waits for a follow-up refresh started once a tracked operation finishes', async () => {
		const upload = deferred();
		const refresh = deferred();
		const trackedUpload = trackRefresh(upload.promise);

		let done = false;
		const waiting = waitForPendingRefreshes().then(() => (done = true));
		// Like an upload handler awaiting the upload, then starting a page refresh
		trackedUpload
			.then(() => Promise.resolve())
			.then(() => {
				trackRefresh(refresh.promise);
			});
		upload.resolve();
		await new Promise((r) => setTimeout(r, 10));
		expect(done).toBe(false);

		refresh.resolve();
		await waiting;
		expect(done).toBe(true);
	});

	it('does not get stuck on a failed refresh', async () => {
		const refresh = deferred();
		trackRefresh(refresh.promise).catch(() => {});
		refresh.reject(new Error('network error'));
		await expect(waitForPendingRefreshes()).resolves.toBeUndefined();
	});
});
