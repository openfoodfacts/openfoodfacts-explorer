<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import type { Spec } from 'vega';
	import type { TopLevelSpec } from 'vega-lite';

	type Props = {
		spec: Spec | TopLevelSpec;
		title?: string;
	};

	type VegaMarkEncodeEntry = {
		fill?: { value: string };
		stroke?: { value: string };
	};

	type VegaMarkEncode = {
		enter?: VegaMarkEncodeEntry;
		update?: VegaMarkEncodeEntry;
	};

	type VegaMark = {
		type: string;
		encode?: VegaMarkEncode;
		[key: string]: unknown;
	};

	let { spec, title }: Props = $props();
	let chartContainer: HTMLDivElement | undefined = $state();
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let darkMode = $state(false);

	function getDarkModeConfig() {
		const style = getComputedStyle(document.documentElement);
		const labelColor = style.getPropertyValue('--color-base-content').trim();
		const gridColor = style.getPropertyValue('--color-base-300').trim();

		return {
			background: 'transparent',
			axis: {
				domainColor: labelColor,
				gridColor: gridColor,
				labelColor: labelColor,
				tickColor: labelColor,
				titleColor: labelColor
			},
			legend: {
				labelColor: labelColor,
				titleColor: labelColor
			},
			title: {
				color: labelColor
			},
			view: {
				stroke: 'transparent'
			}
		};
	}
	// Vega compiles specs with hardcoded color values and does not support
	// CSS variables natively, so we manually patch those hardcoded colors
	// in the compiled spec to make charts visible in dark mode.
	function patchMarksForDarkMode(
		marks: VegaMark[],
		primaryColor: string,
		textColor: string
	): VegaMark[] {
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
					enter: { ...mark.encode?.enter, fill: { value: textColor } }
				} as VegaMarkEncode
			};
			return patched;
		});
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

			if (darkMode) {
				const style = getComputedStyle(document.documentElement);
				const primaryColor = style.getPropertyValue('--color-primary').trim();
				const textColor = style.getPropertyValue('--color-base-content').trim();

				const rawMarks = ((compiledSpec as Spec).marks || []) as unknown as VegaMark[];
				const patchedMarks = patchMarksForDarkMode(rawMarks, primaryColor, textColor);

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

	onMount(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		darkMode = mediaQuery.matches;
		const handler = (e: MediaQueryListEvent) => {
			darkMode = e.matches;
		};
		mediaQuery.addEventListener('change', handler);
		return () => mediaQuery.removeEventListener('change', handler);
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
