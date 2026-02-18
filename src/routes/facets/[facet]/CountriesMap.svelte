<script lang="ts">
	import { getTaxo } from '$lib/api';
	import type { Country, FacetResponse, Taxonomy } from '@openfoodfacts/openfoodfacts-nodejs';
	import { onMount } from 'svelte';
	import * as topojson from 'topojson-client';
	import type { GeometryCollection, Topology } from 'topojson-specification';
	import type { Feature, Geometry } from 'geojson';
	import * as iso from 'iso-3166-1';
	import worldAtlas from 'world-atlas/countries-110m.json';
	import { SvelteMap } from 'svelte/reactivity';

	type Props = {
		facet: FacetResponse;
	};

	let { facet }: Props = $props();

	const fmt = new Intl.NumberFormat();

	// Interpolate between teal (#0d9488) and orange (#d97706) in RGB space
	function choroplethColor(intensity: number): string {
		const r = Math.round(13 + (217 - 13) * intensity);
		const g = Math.round(148 + (119 - 148) * intensity);
		const b = Math.round(136 + (6 - 136) * intensity);
		return `rgb(${r},${g},${b})`;
	}

	// Normalize a polygon ring so no two consecutive longitudes jump by >180°.
	// This prevents Leaflet from drawing lines across the map for features that
	// cross the antimeridian (Russia, USA/Alaska, Fiji, etc.).
	function normalizeRing(ring: number[][]): number[][] {
		const out: number[][] = [ring[0].slice()];
		for (let i = 1; i < ring.length; i++) {
			const prev = out[i - 1][0];
			let lng = ring[i][0];
			while (lng - prev > 180) lng -= 360;
			while (prev - lng > 180) lng += 360;
			out.push([lng, ring[i][1]]);
		}
		return out;
	}

	function normalizeCoords(geometry: Geometry): Geometry {
		if (geometry.type === 'Polygon') {
			return { ...geometry, coordinates: geometry.coordinates.map(normalizeRing) };
		}
		if (geometry.type === 'MultiPolygon') {
			return {
				...geometry,
				coordinates: geometry.coordinates.map((poly) => poly.map(normalizeRing))
			};
		}
		return geometry;
	}

	// Pre-compute GeoJSON once — topology never changes
	// Territories to exclude from the map (world-atlas numeric ISO IDs)
	const MIN_ZOOM = 1;
	const INITIAL_ZOOM = 1;

	const EXCLUDED_NUMERIC_IDS = new Set(['010']); // 010 = Antarctica
	const topology = worldAtlas as unknown as Topology;
	const rawGeoJSON = topojson.feature(topology, topology.objects.countries as GeometryCollection);
	const worldGeoJSON: typeof rawGeoJSON = {
		...rawGeoJSON,
		features: rawGeoJSON.features
			.filter((f) => !EXCLUDED_NUMERIC_IDS.has(String(f.id).padStart(3, '0')))
			.map((f) => ({ ...f, geometry: normalizeCoords(f.geometry) }))
	};

	let mapContainer: HTMLElement;
	let mapInstance: import('leaflet').Map | null = $state(null);
	let L: typeof import('leaflet') | null = $state(null);
	let countryTaxonomy: Taxonomy<Country> | null = $state(null);
	let legendControl: import('leaflet').Control | null = null;
	let isDark: boolean = $state(false);

	onMount(async () => {
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		isDark = mq.matches;
		mq.addEventListener('change', (e) => (isDark = e.matches));

		const leaflet = await import('leaflet');
		L = leaflet;
		const map = leaflet
			.map(mapContainer, { zoomControl: true, minZoom: MIN_ZOOM })
			.setView([20, 0], INITIAL_ZOOM);
		mapInstance = map;

		// Leaflet injects its own background-color via JS; override it directly
		mapContainer.style.setProperty('background', 'transparent');

		countryTaxonomy = await getTaxo<Country>('countries', fetch);
	});

	// Re-render whenever the map, taxonomy, facet data, or color scheme changes
	$effect(() => {
		if (mapInstance == null || L == null || countryTaxonomy == null) return;
		updateMap(mapInstance, L, countryTaxonomy, isDark);
	});

	function resolveNumericId(id: string, entry: Country): string | null {
		// Try alpha-3 first, then fall back to alpha-2
		const alpha3 = entry.country_code_3?.en;
		if (alpha3) {
			const info = iso.whereAlpha3(alpha3);
			if (info) return info.numeric.padStart(3, '0');
		}
		const alpha2 = entry.country_code_2?.en;
		if (alpha2) {
			const info = iso.whereAlpha2(alpha2);
			if (info) return info.numeric.padStart(3, '0');
		}
		return null;
	}

	function updateMap(
		map: import('leaflet').Map,
		leaflet: typeof import('leaflet'),
		taxo: Taxonomy<Country>,
		dark: boolean
	) {
		// Remove existing GeoJSON layers
		map.eachLayer((layer) => {
			if (layer instanceof leaflet.GeoJSON) map.removeLayer(layer);
		});

		// Remove existing legend
		if (legendControl) {
			legendControl.remove();
			legendControl = null;
		}

		// 1. Build a lookup: taxonomy id → product count (from facet data, 0 if absent)
		const productsByTaxoId = new Map<string, number>(
			facet.tags.map(({ id, products }) => [id, products])
		);

		// 2. Walk every country in the taxonomy; resolve its numeric ISO id
		const countryData = new SvelteMap<string, { name: string; products: number }>();
		for (const [id, entry] of Object.entries(taxo)) {
			const numericId = resolveNumericId(id, entry as Country);
			if (!numericId) continue;
			countryData.set(numericId, {
				name: (entry as Country).name?.en ?? id,
				products: productsByTaxoId.get(id) ?? 0
			});
		}

		const maxProducts = Math.max(...countryData.values().map((d) => d.products), 1);

		const dataBorder = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
		const hoverBorder = dark ? '#f9fafb' : '#1f2937';

		// Only render countries present in the taxonomy
		const filteredGeoJSON = {
			...worldGeoJSON,
			features: worldGeoJSON.features.filter((f) => countryData.has(String(f.id).padStart(3, '0')))
		};

		function getStyle(feature: Feature | undefined): import('leaflet').PathOptions {
			const numericId = String(feature?.id).padStart(3, '0');
			const data = countryData.get(numericId);
			if (!data) {
				return { fillOpacity: 1, fillColor: '#9ca3af', color: '#6b7280', weight: 1 };
			}
			const intensity = Math.log1p(data.products) / Math.log1p(maxProducts);
			return {
				fillColor: choroplethColor(intensity),
				fillOpacity: 1,
				color: dataBorder,
				weight: 1
			};
		}

		const geoLayer = leaflet
			.geoJSON(filteredGeoJSON, {
				style: (feature) => getStyle(feature),
				onEachFeature: (feature, layer) => {
					const numericId = String(feature?.id).padStart(3, '0');
					const data = countryData.get(numericId);

					// Tooltip shown on hover for every country
					const tooltipContent = data
						? `<strong>${data.name}</strong><br>${fmt.format(data.products)} products`
						: (feature.properties?.name ?? numericId);
					(layer as import('leaflet').Path).bindTooltip(tooltipContent, { sticky: true });

					// Hover highlight
					layer.on({
						mouseover(e) {
							const path = e.target as import('leaflet').Path;
							path.setStyle({ weight: 2, color: hoverBorder, fillOpacity: 0.75 });
							path.bringToFront();
						},
						mouseout(e) {
							const path = e.target as import('leaflet').Path;
							path.setStyle(getStyle(feature));
						}
					});

					// Click popup with full detail (only for countries with data)
					if (data) {
						layer.bindPopup(`<strong>${data.name}</strong>: ${fmt.format(data.products)} products`);
					}
				}
			})
			.addTo(map);

		// Fit the map to the rendered countries (all have data now)
		if (geoLayer.getLayers().length > 0) {
			map.fitBounds(geoLayer.getBounds(), { padding: [20, 20] });
		}

		// Add legend — CSS class is used so the style block below handles dark mode
		const minVal = Math.min(...countryData.values().map((d) => d.products));
		const LegendControl = leaflet.Control.extend({
			onAdd() {
				const div = leaflet.DomUtil.create('div', 'countries-map-legend');
				div.innerHTML = `
					<strong>Products</strong>
					<div class="countries-map-legend-scale">
						<div class="countries-map-legend-gradient"></div>
						<div class="countries-map-legend-labels">
							<span>${fmt.format(maxProducts)}</span>
							<span>${fmt.format(minVal)}</span>
						</div>
					</div>`;
				return div;
			}
		});
		legendControl = new LegendControl({ position: 'bottomright' });
		legendControl.addTo(map);
	}
</script>

<div bind:this={mapContainer} class="countries-map h-96 w-full"></div>

<style>
	:global(.countries-map-legend) {
		background: white;
		color: #111827;
		padding: 8px 10px;
		font-size: 12px;
		line-height: 1.6;
		border-radius: 4px;
		border: 1px solid rgba(0, 0, 0, 0.2);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}
	:global(.countries-map-legend strong) {
		display: block;
		margin-bottom: 6px;
	}
	:global(.countries-map-legend-scale) {
		display: flex;
		align-items: stretch;
		gap: 6px;
		height: 60px;
	}
	:global(.countries-map-legend-gradient) {
		width: 14px;
		border-radius: 2px;
		border: 1px solid rgba(0, 0, 0, 0.15);
		background: linear-gradient(to bottom, rgb(217, 119, 6), rgb(13, 148, 136));
	}
	:global(.countries-map-legend-labels) {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		font-size: 11px;
	}

	@media (prefers-color-scheme: dark) {
		:global(.countries-map-legend) {
			background: #1f2937;
			color: #f9fafb;
			border-color: rgba(255, 255, 255, 0.15);
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
		}
		:global(.countries-map-legend-gradient) {
			border-color: rgba(255, 255, 255, 0.1);
		}
	}
</style>
