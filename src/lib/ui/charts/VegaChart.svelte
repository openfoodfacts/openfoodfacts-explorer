<script lang="ts">
	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import type { Spec, View } from 'vega';
	import type { TopLevelSpec } from 'vega-lite';

	import * as compat from '#lib/compat.js';
	import { patchMarksForDarkMode, withReadableBandLabels } from './vega-spec.js';

	type Props = { spec: Spec | TopLevelSpec; title?: string; height?: number };
	let { spec, title, height }: Props = $props();
	let chartContainer: HTMLDivElement | undefined = $state();
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let darkMode = $state<boolean | undefined>(undefined);
	let previousView: View | undefined;
	let renderToken = 0;

	function getDarkModeConfig() {
		const style = getComputedStyle(document.documentElement);
		const labelColor = style.getPropertyValue('--color-base-content').trim();
		const gridColor = style.getPropertyValue('--color-base-300').trim();

		return {
			background: 'transparent',
			axis: {
				domainColor: labelColor,
				gridColor,
				labelColor,
				tickColor: labelColor,
				titleColor: labelColor
			},
			legend: { labelColor, titleColor: labelColor },
			title: { color: labelColor },
			view: { stroke: 'transparent' }
		};
	}

	const LABEL_FONT = '10px sans-serif';
	const LABEL_GAP = 10;

	import { neighbourLabelWidth } from '#lib/ui/browser-utils.js';

	async function updateSpec(spec: Spec | TopLevelSpec) {
		// Only run in the browser with a valid chart container and spec
		if (!browser || !chartContainer || !spec) return;

		// Increment the render token to track the current render cycle
		const token = ++renderToken;
		// Every time we finish an async operation, we check if the token is
		// stale to avoid race conditions
		const isStale = () => token !== renderToken;

		// Dynamically import Vega and Vega-Lite
		const vega = await import('vega');
		if (isStale()) return;

		isLoading = true;
		error = null;

		const isVegaLiteSpec = (spec: Spec | TopLevelSpec): spec is TopLevelSpec =>
			spec.$schema?.includes('vega-lite') ?? false;

		const compileVegaSpec = async (spec: Spec | TopLevelSpec) => {
			if (isVegaLiteSpec(spec)) {
				const vegaLite = await import('vega-lite');
				return vegaLite.compile(spec).spec;
			}
			return spec;
		};

		try {
			// Compile the spec to a Vega spec if it's a Vega-Lite spec
			let compiledSpec = await compileVegaSpec(spec);
			if (isStale()) return;

			// Override the compiled spec with height and title if provided
			if (height) compiledSpec = { ...compiledSpec, height };
			if (title) compiledSpec = { ...compiledSpec, title: undefined };

			// Apply readable band labels to the compiled spec
			const bandScales = new Set(
				(compiledSpec.scales ?? []).filter((s) => s.type === 'band').map((s) => s.name)
			);
			compiledSpec = withReadableBandLabels(compiledSpec, bandScales);

			if (darkMode) {
				const style = getComputedStyle(document.documentElement);
				const primaryColor = style.getPropertyValue('--color-primary').trim();

				const patchedMarks = patchMarksForDarkMode(compiledSpec.marks ?? [], primaryColor);

				compiledSpec = {
					...compiledSpec,
					marks: patchedMarks,
					config: {
						...compiledSpec.config,
						...getDarkModeConfig()
					}
				};
			}

			const runtime = vega.parse(compiledSpec);
			if (!runtime) {
				throw new Error('Failed to parse Vega spec');
			}

			// If there was a previous view, finalize it before creating a new one.
			previousView?.finalize();

			// Create a new Vega view
			const view = new vega.View(runtime, {
				renderer: 'svg',
				container: chartContainer,
				hover: true
			});
			previousView = view;

			// Render the chart
			await view.runAsync();
			if (isStale()) return;

			// Turns the labels sideways when neighbours would overlap at the
			// drawn bar width. Reads view.data() because the spec's rows
			// include values its transforms filter out.
			const axisScale = compiledSpec.axes?.find((a) => bandScales.has(a.scale))?.scale;
			const domain = (
				compiledSpec.scales?.find((s) => s.name === axisScale) as
					{ domain?: { data?: string; field?: string } } | undefined
			)?.domain;

			if (axisScale && domain?.data && domain.field) {
				const { data, field } = domain;
				const fitLabels = () => {
					if (isStale()) return;
					const labels = view.data(data).map((row) => String(row[field]));
					const step = (view.scale(axisScale) as unknown as { step(): number }).step();

					const labelsWithoutLanguagePrefix = labels.map((label) =>
						label.replace(/^[a-z]{2}:/, '')
					);

					const labelsSideways =
						step < neighbourLabelWidth(labelsWithoutLanguagePrefix, LABEL_FONT) + LABEL_GAP;

					return view.signal('labelsSideways', labelsSideways).runAsync();
				};
				await fitLabels();
				if (isStale()) return;
				let fittedWidth = view.width();
				view.addResizeListener((width) => {
					// A label flip fires this at the same width; skip it so one flip cannot cause another.
					if (width === fittedWidth) return;
					fittedWidth = width;
					fitLabels();
				});
			}
			isLoading = false;
		} catch (err) {
			if (isStale()) return;
			console.error('Chart rendering error:', err);
			error = err instanceof Error ? err.message : 'Chart failed to load';
			isLoading = false;
		}
	}

	onMount(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		darkMode = mediaQuery.matches;
		const handler = (e: MediaQueryListEvent) => (darkMode = e.matches);
		compat.addMediaQueryListener(mediaQuery, handler);
		return () => {
			compat.removeMediaQueryListener(mediaQuery, handler);
			renderToken++;
			previousView?.finalize();
		};
	});

	$effect(() => {
		if (darkMode !== undefined) {
			updateSpec(spec);
		}
	});
</script>

<div class="mb-4">
	{#if title}
		<h3 class="mb-2 text-lg font-semibold">{title}</h3>
	{/if}
	<div bind:this={chartContainer} class="vega-chart relative w-full">
		{#if isLoading}
			<div class="flex h-32 items-center justify-center">
				<div class="loading loading-md loading-spinner"></div>
				<span class="ml-2">Loading chart...</span>
			</div>
		{/if}
		{#if error}
			<div class="rounded border border-error/20 bg-error/10 p-4 text-error">
				<p class="font-semibold">Chart Error:</p>
				<p class="text-sm">{error}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.vega-chart svg) {
		width: 100%;
		height: auto;
		display: block;
	}
</style>
