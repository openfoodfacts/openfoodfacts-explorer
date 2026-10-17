export class ServerTiming {
	private entries: string[] = [];
	private n = 0;

	async measure<T>(name: string, fn: () => Promise<T>, desc?: string): Promise<T> {
		const start = performance.now();
		try {
			return await fn();
		} finally {
			this.add(name, performance.now() - start, desc);
		}
	}

	add(name: string, dur: number, desc?: string) {
		this.entries.push(`${name}-${this.n++};dur=${dur.toFixed(1)}${desc ? `;desc="${desc}"` : ''}`);
	}

	mark(name: string, desc?: string) {
		// for non-duration flags like cache hit/miss
		this.entries.push(`${name}${desc ? `;desc="${desc}"` : ''}`);
	}

	toHeader() {
		return this.entries.join(', ');
	}
}
