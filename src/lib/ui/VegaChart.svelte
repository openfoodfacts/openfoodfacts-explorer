<script lang="ts">
	import { browser } from '$app/environment';
	import type { Spec } from 'vega';
	import type { TopLevelSpec } from 'vega-lite';

	type Props = {
		spec: Spec | TopLevelSpec;
		title?: string;
	};

	let { spec, title }: Props = $props();
	let chartContainer: HTMLDivElement | undefined = $state();
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	async function updateSpec(spec: Spec | TopLevelSpec) {
		if (!browser || !chartContainer || !spec) return;

		const vega = await import('vega');
		const vegaLite = await import('vega-lite');

		isLoading = true;
		error = null;

		try {
			const isVegaLite = spec.$schema?.includes('vega-lite');

			let compiledSpec = isVegaLite ? vegaLite.compile(spec as TopLevelSpec).spec : (spec as Spec);

			const runtime = vega.parse(compiledSpec);
			if (!runtime) {
				throw new Error('Failed to parse Vega spec');
			}

			const view = new vega.View(runtime, {
				renderer: 'svg',
				container: chartContainer,
				hover: true
			});

			await view.runAsync();
			isLoading = false;
		} catch (err) {
			console.error('Chart rendering error:', err);
			error = err instanceof Error ? err.message : 'Chart failed to load';
			isLoading = false;
		}
	}

	$effect(() => {
		updateSpec(spec);
	});
</script>

<div class="mb-4">
	{#if title}
		<h3 class="mb-2 text-lg font-semibold">{title}</h3>
	{/if}
	<div bind:this={chartContainer} class="vega-chart relative w-full">
		{#if isLoading}
			<div class="flex h-32 items-center justify-center">
				<div class="loading loading-spinner loading-md"></div>
				<span class="ml-2">Loading chart...</span>
			</div>
		{/if}
		{#if error}
			<div class="bg-error/10 border-error/20 text-error rounded border p-4">
				<p class="font-semibold">Chart Error:</p>
				<p class="text-sm">{error}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.vega-chart svg) {
		width: 100%;
		height: 200px;
		display: block;
	}
</style>
