<script lang="ts">
	import { onMount } from 'svelte';
	import type { PriceFull } from '@openfoodfacts/openfoodfacts-nodejs';
	import L, {
		type Icon,
		type Map,
		type Marker,
		type MarkerClusterGroup,
		type LatLngBoundsExpression
	} from 'leaflet';
	import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png?url';
	import markerIconUrl from 'leaflet/dist/images/marker-icon.png?url';
	import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png?url';

	import 'leaflet/dist/leaflet.css';
	import 'leaflet.markercluster';
	import 'leaflet.markercluster/dist/MarkerCluster.css';
	import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

	type Props = {
		prices: PriceFull[];
	};

	let { prices }: Props = $props();

	let mapContainer: HTMLElement;
	let mapInstance: Map | null = null;
	let markerClusterGroup: MarkerClusterGroup | null = null;
	let markers: Marker[] = [];
	let markerIcon: Icon | null = null;

	const MAX_INITIAL_ZOOM = 3;
	const MAX_ZOOM = 19;
	const TILES_BASE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
	const ATTRIBUTION = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
	const WORLD_BOUNDS: LatLngBoundsExpression = [
		[-90, -180],
		[90, 180]
	];

	onMount(() => {
		markerIcon = L.icon({
			iconRetinaUrl: markerIcon2xUrl,
			iconUrl: markerIconUrl,
			shadowUrl: markerShadowUrl,
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			tooltipAnchor: [16, -28],
			shadowSize: [41, 41]
		});
		mapInstance = L.map(mapContainer, {
			maxBounds: WORLD_BOUNDS,
			maxBoundsViscosity: 1
		});
		L.tileLayer(TILES_BASE_URL, {
			maxZoom: MAX_ZOOM,
			attribution: ATTRIBUTION,
			noWrap: true
		}).addTo(mapInstance);

		return () => {
			cleanupMap();
		};
	});

	$effect(() => {
		if (mapInstance && markerIcon && prices) {
			updateMap(prices);
		}
	});

	function updateMap(prices: PriceFull[]) {
		if (!mapInstance) return;

		cleanupMarkers();

		const validPrices = prices.filter(
			(price) => price.location && price.location.osm_lat != null && price.location.osm_lon != null
		);

		if (validPrices.length === 0) {
			console.error('No valid price locations found for map');
			return;
		}

		markerClusterGroup = (
			L as typeof L & { markerClusterGroup: () => MarkerClusterGroup }
		).markerClusterGroup();

		for (const price of validPrices) {
			try {
				const lat = price.location.osm_lat as number;
				const lon = price.location.osm_lon as number;
				const priceDisplay = price.currency
					? `${price.price ?? 'N/A'} ${price.currency}`
					: (price.price ?? 'N/A');
				const popupContent = `
					<div>
						<p style="font-size: 1.5em;">
							Price: <strong>${priceDisplay}</strong>
						</p>
						<p>
							${price.location.osm_display_name} - ${price.location.osm_address_city ?? ''}
							${price.location.osm_address_country ?? ''}
						</p>
					</div>
				`;
				const marker = L.marker([lat, lon], { icon: markerIcon ?? undefined });
				marker.bindPopup(popupContent);
				markerClusterGroup.addLayer(marker);
				markers.push(marker);
			} catch (error) {
				console.error('Error creating marker:', error);
			}
		}

		markerClusterGroup.addTo(mapInstance);

		const bounds: LatLngBoundsExpression = validPrices.map((price) => [
			price.location.osm_lat as number,
			price.location.osm_lon as number
		]) as LatLngBoundsExpression;
		mapInstance.fitBounds(bounds);
		mapInstance.setZoom(Math.min(mapInstance.getZoom(), MAX_INITIAL_ZOOM));
	}

	function cleanupMarkers() {
		if (markerClusterGroup && mapInstance) {
			mapInstance.removeLayer(markerClusterGroup);
		}
		markers = [];
		markerClusterGroup = null;
	}

	function cleanupMap() {
		cleanupMarkers();
		if (mapInstance) {
			mapInstance.remove();
			mapInstance = null;
		}
		markerIcon = null;
	}
</script>

<div bind:this={mapContainer} class="h-96 w-full rounded-lg"></div>
