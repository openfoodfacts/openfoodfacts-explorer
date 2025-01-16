<script lang="ts">
	import type { KnowledgeMapElement } from '$lib/api';
	import { onMount } from 'svelte';

	let { element }: { element: KnowledgeMapElement } = $props();

	const MAX_INITIAL_ZOOM = 3;
	const MAX_ZOOM = 19;
	const TILES_BASE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
	const ATTRIBUTION = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

	onMount(async () => {
		const { default: L } = await import('leaflet');

		const map = L.map('map', {});
		map.fitBounds(
			element.map_element.pointers.map((pointer) => [pointer.geo.lat, pointer.geo.lng])
		);

		map.setZoom(Math.min(map.getZoom(), MAX_INITIAL_ZOOM));
		L.tileLayer(TILES_BASE_URL, { maxZoom: MAX_ZOOM, attribution: ATTRIBUTION }).addTo(map);

		for (const pointer of element.map_element.pointers) {
			const marker = L.marker([pointer.geo.lat, pointer.geo.lng]);
			marker.addTo(map);
		}
	});
</script>

<div id="map" class="h-96 w-full rounded-lg"></div>
