<script lang="ts">
	import VegaChart from './VegaChart.svelte';
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import type { Spec } from 'vega';
	import { _ } from '$lib/i18n';
	import { REFERENCE_INTAKES, calculateNutrientPercentage } from '$lib/api/nutriments';

	type Props = {
		product: Product;
	};

	let { product }: Props = $props();

	const nutrientData = $derived.by(() => {
		if (!product || !product.nutriments) return [];

		const nutrients = [
			{ key: 'fat', label: $_('product.edit.nutrient.fat') },
			{ key: 'saturated-fat', label: $_('product.edit.nutrient.saturated-fat') },
			{ key: 'sugars', label: $_('product.edit.nutrient.sugars') },
			{ key: 'salt', label: $_('product.edit.nutrient.salt') }
		];

		return nutrients.map((n) => {
			const value = (product.nutriments?.[`${n.key}_100g`] as number) || 0;
			const unconstrainedPercentage = calculateNutrientPercentage(
				value,
				n.key as keyof typeof REFERENCE_INTAKES
			);
			const percentage = Math.min(unconstrainedPercentage, 120);
			return {
				nutrient: n.label,
				value: Math.round(value * 10) / 10,
				percentage: Math.round(percentage * 10) / 10
			};
		});
	});

	// Build a proper Vega v5 radar/spider chart spec with dark-theme styling
	// Drastically increased size to 600x600 to fill the card space
	const spec = $derived.by((): Spec => {
		return {
			$schema: 'https://vega.github.io/schema/vega/v5.json',
			width: 600,
			height: 600,
			padding: 60,
			background: 'transparent',
			autosize: 'none',
			signals: [
				{ name: 'radius', value: 250 },
				{ name: 'startAngle', value: -Math.PI / 2 }
			],
			data: [
				{
					name: 'table',
					values: nutrientData
				},
				{
					name: 'keys',
					source: 'table',
					transform: [{ type: 'aggregate', groupby: ['nutrient'] }]
				}
			],
			scales: [
				{
					name: 'angular',
					type: 'point',
					range: { signal: '[startAngle, startAngle + 2 * PI]' },
					padding: 0.5,
					domain: { data: 'table', field: 'nutrient' }
				},
				{
					name: 'radial',
					type: 'linear',
					range: { signal: '[0, radius]' },
					zero: true,
					nice: false,
					domain: [0, 120]
				}
			],
			encode: {
				enter: {
					x: { signal: 'width / 2' },
					y: { signal: 'height / 2' }
				}
			},
			marks: [
				// Spoke lines
				{
					type: 'rule',
					from: { data: 'keys' },
					encode: {
						enter: {
							x: { value: 0 },
							y: { value: 0 },
							x2: { signal: 'radius * cos(scale("angular", datum.nutrient))' },
							y2: { signal: 'radius * sin(scale("angular", datum.nutrient))' },
							stroke: { value: '#4a5568' },
							strokeWidth: { value: 1 },
							strokeOpacity: { value: 0.6 }
						}
					}
				},
				// Grid ring at 25%
				{
					type: 'line',
					from: { data: 'keys' },
					encode: {
						enter: {
							interpolate: { value: 'linear-closed' },
							x: { signal: 'scale("radial", 25) * cos(scale("angular", datum.nutrient))' },
							y: { signal: 'scale("radial", 25) * sin(scale("angular", datum.nutrient))' },
							stroke: { value: '#4a5568' },
							strokeWidth: { value: 0.5 },
							strokeOpacity: { value: 0.4 },
							fill: { value: 'transparent' }
						}
					}
				},
				// Grid ring at 50%
				{
					type: 'line',
					from: { data: 'keys' },
					encode: {
						enter: {
							interpolate: { value: 'linear-closed' },
							x: { signal: 'scale("radial", 50) * cos(scale("angular", datum.nutrient))' },
							y: { signal: 'scale("radial", 50) * sin(scale("angular", datum.nutrient))' },
							stroke: { value: '#4a5568' },
							strokeWidth: { value: 0.5 },
							strokeOpacity: { value: 0.6 },
							fill: { value: 'transparent' }
						}
					}
				},
				// Grid ring at 100% (highlighted)
				{
					type: 'line',
					from: { data: 'keys' },
					encode: {
						enter: {
							interpolate: { value: 'linear-closed' },
							x: { signal: 'scale("radial", 100) * cos(scale("angular", datum.nutrient))' },
							y: { signal: 'scale("radial", 100) * sin(scale("angular", datum.nutrient))' },
							stroke: { value: '#e2533a' },
							strokeWidth: { value: 1.5 },
							strokeOpacity: { value: 0.8 },
							strokeDash: { value: [5, 4] },
							fill: { value: 'transparent' }
						}
					}
				},
				{
					type: 'text',
					encode: {
						enter: {
							x: { value: 6 },
							y: { signal: '-scale("radial", 100)' },
							text: { signal: `"${$_('product.nutrition.radar_chart_label_100_ri')}"` },
							fill: { value: '#e2533a' },
							fontSize: { value: 10 },
							fontWeight: { value: 'bold' },
							opacity: { value: 0.9 }
						}
					}
				},
				{
					type: 'text',
					encode: {
						enter: {
							x: { value: 6 },
							y: { signal: '-scale("radial", 50)' },
							text: { value: '50%' },
							fill: { value: '#a0aec0' },
							fontSize: { value: 9 },
							opacity: { value: 0.8 }
						}
					}
				},
				// Data area fill (filled polygon)
				{
					type: 'line',
					from: { data: 'table' },
					encode: {
						enter: {
							interpolate: { value: 'linear-closed' },
							x: {
								signal: 'scale("radial", datum.percentage) * cos(scale("angular", datum.nutrient))'
							},
							y: {
								signal: 'scale("radial", datum.percentage) * sin(scale("angular", datum.nutrient))'
							},
							stroke: { value: '#f97316' },
							strokeWidth: { value: 3 },
							strokeJoin: { value: 'round' },
							fill: { value: '#f97316' },
							fillOpacity: { value: 0.25 }
						}
					}
				},
				// Data points
				{
					type: 'symbol',
					from: { data: 'table' },
					encode: {
						enter: {
							x: {
								signal: 'scale("radial", datum.percentage) * cos(scale("angular", datum.nutrient))'
							},
							y: {
								signal: 'scale("radial", datum.percentage) * sin(scale("angular", datum.nutrient))'
							},
							fill: { value: '#f97316' },
							stroke: { value: '#fff' },
							strokeWidth: { value: 2 },
							size: { value: 80 },
							shape: { value: 'circle' },
							tooltip: {
								signal: `{"${$_('product.nutrition.radar_chart_tooltip_nutrient')}": datum.nutrient, "${$_('product.nutrition.radar_chart_tooltip_amount')}": datum.value + "g", "${$_('product.nutrition.radar_chart_tooltip_intake')}": datum.percentage + "%"}`
							}
						},
						update: {
							opacity: { value: 1 }
						},
						hover: {
							opacity: { value: 0.8 },
							size: { value: 120 }
						}
					}
				},
				// Axis labels
				{
					type: 'text',
					from: { data: 'keys' },
					encode: {
						enter: {
							x: { signal: '(radius + 35) * cos(scale("angular", datum.nutrient))' },
							y: { signal: '(radius + 35) * sin(scale("angular", datum.nutrient))' },
							text: { field: 'nutrient' },
							align: {
								signal:
									'cos(scale("angular", datum.nutrient)) > 0.1 ? "left" : cos(scale("angular", datum.nutrient)) < -0.1 ? "right" : "center"'
							},
							baseline: {
								signal:
									'sin(scale("angular", datum.nutrient)) > 0.1 ? "top" : sin(scale("angular", datum.nutrient)) < -0.1 ? "bottom" : "middle"'
							},
							fill: { value: '#e2e8f0' },
							fontSize: { value: 16 },
							fontWeight: { value: 'bold' }
						}
					}
				}
			]
		};
	});
</script>

<div class="card bg-base-200 border-base-300 border shadow-md">
	<div class="card-body p-6">
		<h3 class="card-title mb-1 text-lg font-semibold">
			{$_('product.nutrition.radar_chart_title')}
		</h3>
		<p class="text-base-content/50 mb-4 text-sm">
			{$_('product.nutrition.radar_chart_note', {
				values: { basis: '100g', intake: '2000 kcal' }
			})}
		</p>
		<div class="flex w-full justify-center">
			{#if nutrientData.length > 0}
				<!-- Spec is 600x600 + 60px padding = ~720px total bounding box -->
				<VegaChart {spec} height="650px" />
			{:else}
				<div class="flex h-80 items-center justify-center text-sm opacity-50">
					{$_('product.nutrition.radar_chart_no_data')}
				</div>
			{/if}
		</div>
		<div class="mt-4 flex items-center justify-center gap-6 text-sm font-medium opacity-70">
			<span class="flex items-center gap-2">
				<span class="inline-block h-3 w-6 rounded" style="background:#f97316"></span>
				{$_('product.nutrition.radar_chart_legend_level')}
			</span>
			<span class="flex items-center gap-2">
				<span
					class="inline-block h-3 w-6 rounded border border-dashed border-[#e2533a]"
					style="background: transparent"
				></span>
				{$_('product.nutrition.radar_chart_legend_limit')}
			</span>
		</div>
	</div>
</div>
