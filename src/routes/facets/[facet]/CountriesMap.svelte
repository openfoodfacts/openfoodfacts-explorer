<script lang="ts">
	import { onMount } from 'svelte';

	import DOMPurify from 'isomorphic-dompurify';
	import worldAtlas from 'world-atlas/countries-110m.json' with { type: 'json' };
	import * as topojson from 'topojson-client';
	import * as iso from 'iso-3166-1';

	import { getTaxo } from '$lib/api';

	import type { GeometryCollection, Topology } from 'topojson-specification';
	import type { Country, FacetResponse, Taxonomy } from '@openfoodfacts/openfoodfacts-nodejs';
	import type { Feature, Geometry, Position } from 'geojson';
	import type * as Leaflet from 'leaflet';
	let isMounted = false;

	type Props = { facet: FacetResponse };
	let { facet }: Props = $props();

	const numberFormat = new Intl.NumberFormat();

	type RGB = [number, number, number];

	const rgbToCSS = (rgb: RGB) => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

	const THEME = {
		// Choropleth scale
		gradient: {
			start: [94, 163, 157] as RGB, // Teal-400 desaturated
			end: [234, 88, 12] as RGB // Orange-600 saturated
		},
		// Fallback for countries with no data
		noData: {
			fill: '#9ca3af', // Gray-400
			stroke: '#6b7280' // Gray-500
		},
		// Interactive states
		borders: {
			dark: 'rgba(255, 255, 255, 0.4)',
			light: 'rgba(0, 0, 0, 0.35)',
			hoverDark: '#f9fafb', // Gray-50
			hoverLight: '#1f2937' // Gray-800
		}
	};

	/**
	 * Interpolate between two colors in RGB space.
	 * @returns a CSS color string like "rgb(123,45,67)"
	 */
	function rgbInterpolate(startColor: RGB, endColor: RGB, intensity: number): string {
		const interp = (start: number, end: number) => Math.round(start + (end - start) * intensity);
		const r = interp(startColor[0], endColor[0]);
		const g = interp(startColor[1], endColor[1]);
		const b = interp(startColor[2], endColor[2]);
		return `rgb(${r},${g},${b})`;
	}

	/**
	 * Normalize a polygon ring so no two consecutive longitudes jump by >180°.
	 * This prevents Leaflet from drawing lines across the map for features that
	 * cross the antimeridian (Russia, USA/Alaska, Fiji, etc.).
	 */
	function normalizeRing(ring: Position[]): Position[] {
		const out: Position[] = [ring[0].slice()];
		for (let i = 1; i < ring.length; i++) {
			const prev = out[i - 1][0];
			let lng = ring[i][0];
			while (lng - prev > 180) lng -= 360;
			while (prev - lng > 180) lng += 360;
			out.push([lng, ring[i][1]]);
		}
		return out;
	}

	/**
	 * Calls `normalizeRing` on all polygon coordinates in the geometry, if needed.
	 * This is necessary because some countries have polygons that cross the antimeridian.
	 */
	function normalizeCoords(g: Geometry): Geometry {
		if (g.type === 'Polygon') {
			return { ...g, coordinates: g.coordinates.map(normalizeRing) };
		}
		if (g.type === 'MultiPolygon') {
			return {
				...g,
				coordinates: g.coordinates.map((poly) => poly.map(normalizeRing))
			};
		}
		return g;
	}

	// Map configuration
	const MIN_ZOOM = 1;
	const INITIAL_ZOOM = 1;

	// Exclude non-meaningful surfaces
	const EXCLUDED_NUMERIC_IDS = new Set(['010']); // 010 = Antarctica

	// Type assertion to satisfy TypeScript
	const topology = worldAtlas as unknown as Topology;

	// World geometry, with filtering and coordinate normalization applied
	const rawGeoJSON = topojson.feature(topology, topology.objects.countries as GeometryCollection);
	const worldGeoJSON: typeof rawGeoJSON = {
		...rawGeoJSON,
		features: rawGeoJSON.features
			.filter((f) => !EXCLUDED_NUMERIC_IDS.has(String(f.id).padStart(3, '0')))
			.map((f) => ({ ...f, geometry: normalizeCoords(f.geometry) }))
	};

	// Lazy loaded country taxonomy data
	let countryTaxonomy: Taxonomy<Country> | null = $state(null);

	// Lazy loaded Leaflet module
	let L: typeof import('leaflet') | null = null;

	// Map instance and legend control references
	let mapContainer: HTMLElement;
	let mapInstance: Leaflet.Map | null = $state(null);
	let legendControl: Leaflet.Control | null = null;

	let isDark: boolean = $state(false);

	onMount(() => {
		isMounted = true;
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		isDark = mq.matches;
		mq.addEventListener('change', (e) => (isDark = e.matches));

		(async () => {
			// Dynamically import Leaflet
			const leaflet = await import('leaflet');

			// Prevent state updates after unmount
			if (!isMounted) return;
			L = leaflet;

			mapInstance = L.map(mapContainer, { zoomControl: true, minZoom: MIN_ZOOM }).setView(
				[20, 0],
				INITIAL_ZOOM
			);

			// Leaflet injects its own background-color via JS; override it directly
			mapContainer.style.setProperty('background', 'transparent');

			const taxonomy = await getTaxo<Country>('countries', fetch);

			// Prevent state updates after unmount
			if (!isMounted) return;
			countryTaxonomy = taxonomy;
		})();

		return () => {
			// Mark component as unmounted
			isMounted = false;
			if (mapInstance) {
				mapInstance.off();
				mapInstance.remove();
				mapInstance = null;
			}
			if (legendControl) {
				legendControl.remove();
				legendControl = null;
			}

			L = null;
			countryTaxonomy = null;
		};
	});

	// Re-render whenever the map, taxonomy, facet data, or color scheme changes
	$effect(() => {
		if (mapInstance == null || countryTaxonomy == null) return;
		updateMap(mapInstance, countryTaxonomy, isDark);
	});

	/**
	 * Resolve a taxonomy entry to its ISO numeric code, trying both alpha-3 and alpha-2 codes.
	 */
	function resolveNumericId(entry: Country): string | null {
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

	function updateMap(map: Leaflet.Map, taxo: Taxonomy<Country>, dark: boolean) {
		if (L == null) {
			console.warn('`updateMap` called before Leaflet loaded');
			return;
		}

		// Remove existing GeoJSON layers
		map.eachLayer((layer) => {
			if (layer instanceof L!.GeoJSON) map.removeLayer(layer);
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
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const countryData = new Map<string, { name: string; products: number }>();
		for (const [id, entry] of Object.entries(taxo)) {
			const numericId = resolveNumericId(entry);
			if (!numericId) continue;
			countryData.set(numericId, {
				name: (entry as Country).name?.en ?? id,
				products: productsByTaxoId.get(id) ?? 0
			});
		}

		const maxProducts = Math.max(...countryData.values().map((d) => d.products), 1);

		const dataBorder = dark ? THEME.borders.dark : THEME.borders.light;
		const hoverBorder = dark ? THEME.borders.hoverDark : THEME.borders.hoverLight;

		// Only render countries present in the taxonomy
		const filteredGeoJSON = {
			...worldGeoJSON,
			features: worldGeoJSON.features.filter((f) => countryData.has(String(f.id).padStart(3, '0')))
		};

		const choroplethColor = (intensity: number) =>
			rgbInterpolate(THEME.gradient.start, THEME.gradient.end, intensity);

		const getStyle = (feature: Feature | undefined): Leaflet.PathOptions => {
			const numericId = String(feature?.id).padStart(3, '0');
			const data = countryData.get(numericId);

			if (!data) {
				return {
					fillOpacity: 1,
					weight: 1,
					fillColor: THEME.noData.fill,
					color: THEME.noData.stroke
				};
			}

			const intensity = Math.log1p(data.products) / Math.log1p(maxProducts);
			return {
				fillColor: choroplethColor(intensity),
				color: dataBorder,
				fillOpacity: 1,
				weight: 1
			};
		};

		const geoLayer = L.geoJSON(filteredGeoJSON, {
			style: (feature) => getStyle(feature),
			onEachFeature: (feature, layer) => {
				const numericId = String(feature?.id).padStart(3, '0');
				const data = countryData.get(numericId);
				const pathLayer = layer as Leaflet.Path;

				// Tooltip shown on hover for every country
				const tooltipContent = data
					? `<strong>${DOMPurify.sanitize(data.name)}</strong><br>${numberFormat.format(data.products)} products`
					: DOMPurify.sanitize(feature.properties?.name ?? numericId);

				pathLayer.bindTooltip(tooltipContent, { sticky: true });

				// Hover highlight
				pathLayer.on({
					mouseover(e) {
						const path = e.target as Leaflet.Path;
						path.setStyle({ weight: 2, color: hoverBorder, fillOpacity: 0.75 });
						path.bringToFront();
					},
					mouseout(e) {
						const path = e.target as Leaflet.Path;
						path.setStyle(getStyle(feature));
					}
				});

				// Click popup with full detail (only for countries with data)
				if (data) {
					const safeName = DOMPurify.sanitize(data.name);
					pathLayer.bindPopup(
						`<strong>${safeName}</strong>: ${numberFormat.format(data.products)} products`
					);
				}
			}
		});

		geoLayer.addTo(map);

		// Fit the map to the bounds of the layers
		if (geoLayer.getLayers().length > 0) {
			map.fitBounds(geoLayer.getBounds(), { padding: [20, 20] });
		}

		// Add legend
		const minVal = Math.min(...countryData.values().map((d) => d.products));
		const LegendControl = L.Control.extend({
			onAdd() {
				if (L == null) {
					throw new Error('Leaflet not loaded');
				}
				const div = L.DomUtil.create('div', 'countries-map-legend');
				div.innerHTML = `
					<strong>Products</strong>
					<div class="countries-map-legend-scale">
						<div class="countries-map-legend-gradient"></div>
						<div class="countries-map-legend-labels">
							<span>${numberFormat.format(maxProducts)}</span>
							<span>${numberFormat.format(minVal)}</span>
						</div>
					</div>`;
				return div;
			}
		});
		legendControl = new LegendControl({ position: 'bottomright' });
		legendControl.addTo(map);
	}
</script>

<p id="countries-map-description" class="sr-only">
	Interactive choropleth map showing the number of products per country for the selected facet.
</p>

<div
	bind:this={mapContainer}
	class="countries-map h-96 w-full"
	style:--gradient-start={rgbToCSS(THEME.gradient.start)}
	style:--gradient-end={rgbToCSS(THEME.gradient.end)}
	role="region"
	aria-label="Country products map"
	aria-describedby="countries-map-description"
></div>

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

	:global(.countries-map-legend-gradient) {
		width: 14px;
		border-radius: 2px;
		border: 1px solid rgba(0, 0, 0, 0.15);
		background: linear-gradient(to top, var(--gradient-start), var(--gradient-end));
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

	:global(.countries-map-legend-labels) {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		font-size: 11px;
	}
</style>
