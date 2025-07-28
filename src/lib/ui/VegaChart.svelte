<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	type Props = {
		spec: any;
		title?: string;
	};

	let { spec, title }: Props = $props();
	let chartContainer: HTMLDivElement | undefined = $state();
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		if (!browser || !chartContainer || !spec) return;

		isLoading = true;
		error = null;

		try {
			const isVegaLite = spec.$schema?.includes('vega-lite');

			if (isVegaLite) {
				const [vegaLite, vega] = await Promise.all([import('vega-lite'), import('vega')]);

				const vegaSpec = vegaLite.compile(spec).spec;
				const view = new vega.View(vega.parse(vegaSpec), {
					renderer: 'svg',
					container: chartContainer,
					hover: true
				});

				await view.runAsync();
			} else {
				const vega = await import('vega');
				const view = new vega.View(vega.parse(spec), {
					renderer: 'svg',
					container: chartContainer,
					hover: true
				});

				await view.runAsync();
			}

			isLoading = false;
		} catch (err) {
			console.error('Chart rendering error:', err);
			error = err instanceof Error ? err.message : 'Chart failed to load';
			isLoading = false;
		}
	});
</script>

<div class="vega-chart-container">
	<div bind:this={chartContainer} class="vega-chart">
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
	.vega-chart-container {
		margin-bottom: 1rem;
	}

	.vega-chart {
		width: 100%;
		position: relative;
	}

	:global(.vega-chart svg) {
		width: 100%;
		height: 200px;
		display: block;
	}
</style>
