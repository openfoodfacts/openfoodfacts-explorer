<script lang="ts">
	import type { KnowledgeMapElement } from '$lib/api';
	import { onMount } from 'svelte';

	let { element }: { element: KnowledgeMapElement } = $props();

	const MAX_INITIAL_ZOOM = 3;
	const MAX_ZOOM = 19;
	const TILES_BASE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
	const ATTRIBUTION = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

	let mapContainer: HTMLElement;
	let mapInstance: any;
	let markers: any[] = [];

	onMount(() => {
		if (!element?.map_element?.pointers?.length) {
			console.error('Map element has no valid pointers');
			return;
		}

		(async () => {
			try {
				const { default: L } = await import('leaflet');

				// Initialize map
				mapInstance = L.map(mapContainer, {});

				// Create valid coordinates array first
				const validPointers = element.map_element.pointers.filter(
					(pointer) => pointer?.geo?.lat != null && pointer?.geo?.lng != null
				);

				if (validPointers.length === 0) {
					console.error('No valid pointers found for map');
					return;
				}

				// Set bounds based on valid pointers
				mapInstance.fitBounds(validPointers.map((pointer) => [pointer.geo.lat, pointer.geo.lng]));

				mapInstance.setZoom(Math.min(mapInstance.getZoom(), MAX_INITIAL_ZOOM));
				L.tileLayer(TILES_BASE_URL, { maxZoom: MAX_ZOOM, attribution: ATTRIBUTION }).addTo(
					mapInstance
				);

				// Add markers for valid pointers
				for (const pointer of validPointers) {
					try {
						const marker = L.marker([pointer.geo.lat, pointer.geo.lng]);
						marker.addTo(mapInstance);
						markers.push(marker);
					} catch (error) {
						console.error('Error creating marker:', error);
					}
				}
			} catch (error) {
				console.error('Error initializing map:', error);
			}
		})();

		// Return cleanup function
		return () => {
			// Cleanup when component is unmounted
			if (mapInstance) {
				// Remove all markers
				markers.forEach((marker) => {
					if (marker) marker.remove();
				});
				// Destroy map instance
				mapInstance.remove();
				mapInstance = null;
				markers = [];
			}
		};
	});
</script>

<div bind:this={mapContainer} class="h-96 w-full rounded-lg"></div>
