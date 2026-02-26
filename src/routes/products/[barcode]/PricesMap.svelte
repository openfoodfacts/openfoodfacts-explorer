<script lang="ts">
	import type { PriceFull } from '@openfoodfacts/openfoodfacts-nodejs';
	import L, {
		type Map,
		type Marker,
		type MarkerClusterGroup,
		type LatLngBoundsExpression
	} from 'leaflet';

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

	const MAX_INITIAL_ZOOM = 3;
	const MAX_ZOOM = 19;
	const TILES_BASE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
	const ATTRIBUTION = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

	$effect(() => {
		mapInstance = L.map(mapContainer, {});
		L.tileLayer(TILES_BASE_URL, { maxZoom: MAX_ZOOM, attribution: ATTRIBUTION }).addTo(mapInstance);

		return () => {
			cleanupMap();
		};
	});

	$effect(() => {
		if (mapInstance && prices) {
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
				const popupContent = `
					<div>
  					    <p style="font-size: 1.5em;">
     					    Price: <strong>${price.price ?? 'N/A'}</strong>
    				    </p>
						<p>
						  ${price.location.osm_display_name} - ${price.location.osm_address_city ?? ''}
								${price.location.osm_address_country ?? ''}
						</p>
					</div>
				`;
				const marker = L.marker([lat, lon]);
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
	}
</script>

<div bind:this={mapContainer} class="h-96 w-full rounded-lg"></div>
