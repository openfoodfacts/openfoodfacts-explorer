<script lang="ts">
	import type { KnowledgeElementMap } from '$lib/api';
	import { onMount } from 'svelte';
	import type { Map, Marker } from 'leaflet';

	let { element }: { element: KnowledgeElementMap } = $props();

	const MAX_INITIAL_ZOOM = 3;
	const MAX_ZOOM = 19;
	const TILES_BASE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
	const ATTRIBUTION = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

	let mapContainer: HTMLElement;
	let mapInstance: Map | null;
	let markers: Marker[] = [];
	let L: typeof import('leaflet') | null = null;

	// Initialize map on mount
	onMount(() => {
		let mounted = true;

		// Using async function for several reasons:
		// 2. Lifecycle Safety: 'mounted' flag prevents updates after component unmount
		// 3. Clean Structure: Keeps async code contained while allowing proper cleanup
		(async () => {
			L = await import('leaflet');

			try {
				if (mounted) {
					// Initialize map
					mapInstance = L.map(mapContainer, {});
					L.tileLayer(TILES_BASE_URL, { maxZoom: MAX_ZOOM, attribution: ATTRIBUTION }).addTo(
						mapInstance
					);

					// Initial update will happen through the $effect
					updateMap();
				}
			} catch (error) {
				console.error('Error initializing map:', error);
			}
		})();

		// Return cleanup function
		return () => {
			mounted = false;
			cleanupMap();
		};
	});

	// Update map when element changes
	$effect(() => {
		if (mapInstance == null || L == null) {
			return;
		}
		updateMap();
	});

	function updateMap() {
		if (!mapInstance || !L) return;

		// Clear existing markers
		cleanupMarkers();

		if (!element?.map_element?.pointers?.length) {
			console.error('Map element has no valid pointers');
			return;
		}

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
	}

	function cleanupMarkers() {
		// Remove all markers
		markers.forEach((marker) => {
			if (marker) marker.remove();
		});
		markers = [];
	}

	function cleanupMap() {
		// Cleanup when component is unmounted
		cleanupMarkers();
		if (mapInstance) {
			mapInstance.remove();
			mapInstance = null;
		}
	}
</script>

<div bind:this={mapContainer} class="h-96 w-full rounded-lg"></div>
