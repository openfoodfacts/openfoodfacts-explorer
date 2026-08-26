/**
 * Runs an array of async tasks with a bounded number of concurrent executions.
 *
 * Unlike `Promise.all`, this does not fire every task simultaneously. Instead it
 * spins up at most `limit` workers that each pull the next task from a shared
 * queue, which keeps downstream APIs from being overwhelmed.
 *
 * Each task's outcome is reported independently via `PromiseSettledResult`, so
 * a single rejection never short-circuits the rest of the batch.
 *
 * @param tasks  Factory functions that each produce a Promise when invoked.
 * @param limit  Maximum number of tasks running at the same time. Values that
 *               are not finite positive numbers are clamped up to `1`.
 * @returns      One settled result per input task, in the original order.
 */
export async function withConcurrencyLimit<T>(
	tasks: (() => Promise<T>)[],
	limit: number
): Promise<PromiseSettledResult<T>[]> {
	if (tasks.length === 0) return [];

	// Normalise the limit to a safe positive integer so a bad input can never
	// stall the worker pool.
	const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 1;

	const results: PromiseSettledResult<T>[] = new Array(tasks.length);
	let nextIndex = 0;

	const worker = async () => {
		while (true) {
			const currentIndex = nextIndex++;
			if (currentIndex >= tasks.length) return;

			try {
				const value = await tasks[currentIndex]();
				results[currentIndex] = { status: 'fulfilled', value };
			} catch (reason) {
				results[currentIndex] = { status: 'rejected', reason };
			}
		}
	};

	const workerCount = Math.min(safeLimit, tasks.length);
	await Promise.all(Array.from({ length: workerCount }, worker));

	return results;
}
