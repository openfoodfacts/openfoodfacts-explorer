<script lang="ts">
	import { browser } from '$app/environment';
	import * as vegaLite from 'vega-lite';
	import * as vega from 'vega';

	type Props = {
		spec: vega.Spec | vegaLite.TopLevelSpec;
		title?: string;
	};

	let { spec, title }: Props = $props();
	let chartContainer: HTMLDivElement | undefined = $state();
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	function updateSpec(spec: vega.Spec | vegaLite.TopLevelSpec) {
		if (!browser || !chartContainer || !spec) return;

		isLoading = true;
		error = null;

		try {
			const isVegaLite = spec.$schema?.includes('vega-lite');

			let compiledSpec = isVegaLite
				? vegaLite.compile(spec as vegaLite.TopLevelSpec).spec
				: (spec as vega.Spec);

			const runtime = vega.parse(compiledSpec);
			if (!runtime) {
				throw new Error('Failed to parse Vega spec');
			}

			const view = new vega.View(runtime, {
				renderer: 'svg',
				container: chartContainer,
				hover: true
			});

			(async () => {
				await view.runAsync();
				isLoading = false;
			})();
		} catch (err) {
			console.error('Chart rendering error:', err);
			error = err instanceof Error ? err.message : 'Chart failed to load';
			isLoading = false;
		}
	}

	$effect(() => updateSpec(spec));
</script>

<div class="mb-4">
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
