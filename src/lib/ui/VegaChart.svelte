<script lang="ts">
	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import type { Spec, View } from 'vega';
	import type { TopLevelSpec } from 'vega-lite';

	import * as compat from '#lib/compat.js';

	type Props = { spec: Spec | TopLevelSpec; title?: string; height?: number };
	type VegaMarkEncodeEntry = { fill?: { value: string }; stroke?: { value: string } };
	type VegaMarkEncode = { enter?: VegaMarkEncodeEntry; update?: VegaMarkEncodeEntry };

	type VegaMark = {
		type: string;
		encode?: VegaMarkEncode;
		[key: string]: unknown;
	};

	let { spec, title, height }: Props = $props();
	let chartContainer: HTMLDivElement | undefined = $state();
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let darkMode = $state<boolean | undefined>(undefined);
	let previousView: View | undefined;

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
	// Vega does not support CSS variables natively. We patch the compiled
	// spec marks to use the current theme colors from CSS variables,
	// consistent with getDarkModeConfig().
	function patchMarksForDarkMode(marks: VegaMark[], primaryColor: string): VegaMark[] {
		return marks.map((mark) => {
			const patched: VegaMark = {
				...mark,
				encode: {
					...mark.encode,
					update: {
						...mark.encode?.update,
						fill: { value: primaryColor },
						stroke: { value: primaryColor }
					},
					enter: { ...mark.encode?.enter, fill: { value: primaryColor } }
				} as VegaMarkEncode
			};
			return patched;
		});
	}

	// Band axis labels stay readable on any width: the `xx:` language prefix is dropped, a label wider
	// than its bar wraps at hyphens, and if neighbouring labels would still collide the whole axis turns
	// sideways (one choice per chart, never mixed).
	const CHAR_WIDTH = 6;
	// Share of each bar slot left empty, so bars never touch on narrow screens.
	const BAND_PADDING = 0.2;
	const LABEL_FONT = '10px sans-serif';
	const LABEL_GAP = 10;

	// Widest pair of neighbouring labels, in px, once each is split at its hyphens.
	function neighbourLabelWidth(labels: string[]): number {
		const context = document.createElement('canvas').getContext('2d');
		if (!context) return 0;
		context.font = LABEL_FONT;
		const widths = labels.map((text) =>
			Math.max(
				...text
					.replace(/^[a-z]{2}:/, '')
					.split('-')
					.map((part) => context.measureText(part).width)
			)
		);
		return Math.max(0, ...widths.slice(1).map((w, i) => (w + widths[i]) / 2));
	}

	async function updateSpec(spec: Spec | TopLevelSpec) {
		if (!browser || !chartContainer || !spec) return;

		const vega = await import('vega');
		const vegaLite = await import('vega-lite');

		isLoading = true;
		error = null;

		try {
			const isVegaLite = spec.$schema?.includes('vega-lite');

			let compiledSpec = isVegaLite ? vegaLite.compile(spec as TopLevelSpec).spec : (spec as Spec);
			if (height) compiledSpec = { ...compiledSpec, height };
			if (title) compiledSpec = { ...compiledSpec, title: undefined };
			const label = "replace(datum.label, regexp('^[a-z]{2}:'), '')";
			const bandScales = new Set(
				(compiledSpec.scales ?? []).filter((s) => s.type === 'band').map((s) => s.name)
			);
			compiledSpec = {
				...compiledSpec,
				// resize: grow the height when the labels turn sideways after the first render.
				autosize: { type: 'fit-x', contains: 'padding', resize: true },
				signals: [...(compiledSpec.signals ?? []), { name: 'labelsSideways', value: false }],
				scales: compiledSpec.scales?.map((s) =>
					s.type === 'band' ? { ...s, padding: BAND_PADDING } : s
				),
				axes: compiledSpec.axes?.map((axis) => {
					const step = `bandwidth('${axis.scale}') / ${1 - BAND_PADDING}`;
					return bandScales.has(axis.scale) && !axis.encode?.labels
						? {
								...axis,
								encode: {
									...axis.encode,
									labels: {
										update: {
											text: {
												signal: `labelsSideways || length(${label}) * ${CHAR_WIDTH} <= ${step} - 4 ? ${label} : split(${label}, '-')`
											},
											angle: { signal: `labelsSideways ? -90 : 0` },
											align: { signal: `labelsSideways ? 'right' : 'center'` },
											baseline: { signal: `labelsSideways ? 'middle' : 'top'` }
										}
									}
								}
							}
						: axis;
				})
			};

			if (darkMode) {
				const style = getComputedStyle(document.documentElement);
				const primaryColor = style.getPropertyValue('--color-primary').trim();

				const rawMarks = ((compiledSpec as Spec).marks || []) as unknown as VegaMark[];
				const patchedMarks = patchMarksForDarkMode(rawMarks, primaryColor);

				compiledSpec = {
					...compiledSpec,
					marks: patchedMarks as unknown as Spec['marks'],
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

			previousView?.finalize();
			const view = new vega.View(runtime, {
				renderer: 'svg',
				container: chartContainer,
				hover: true
			});
			previousView = view;

			await view.runAsync();

			// Sideways or not is decided after the first render, from the rows actually drawn (the spec's
			// rows can include values its transforms filter out) and the real bar spacing. It is decided again
			// only when the container width changes, so a label flip cannot trigger another flip.
			const axisScale = compiledSpec.axes?.find((a) => bandScales.has(a.scale))?.scale;
			const domain = (
				compiledSpec.scales?.find((s) => s.name === axisScale) as
					{ domain?: { data?: string; field?: string } } | undefined
			)?.domain;
			if (axisScale && domain?.data && domain.field) {
				const { data, field } = domain;
				const fitLabels = () => {
					const labels = view.data(data).map((row) => String(row[field]));
					const step = (view.scale(axisScale) as unknown as { step(): number }).step();
					return view
						.signal('labelsSideways', step < neighbourLabelWidth(labels) + LABEL_GAP)
						.runAsync();
				};
				await fitLabels();
				let fittedWidth = view.width();
				view.addResizeListener((width) => {
					if (width === fittedWidth) return;
					fittedWidth = width;
					fitLabels();
				});
			}
			isLoading = false;
		} catch (err) {
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
