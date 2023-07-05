<script lang="ts">
	import type { KnowledgeMapElement } from '$lib/api';
	import { onMount } from 'svelte';

	export let element: KnowledgeMapElement;

	const MAX_INITIAL_ZOOM = 3;

	onMount(async () => {
		const { default: L } = await import('leaflet');

		const map = L.map('map', {});
		map.fitBounds(
			element.map_element.pointers.map((pointer) => [pointer.geo.lat, pointer.geo.lng])
		);

		map.setZoom(Math.min(map.getZoom(), MAX_INITIAL_ZOOM));

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);
		for (const pointer of element.map_element.pointers) {
			const marker = L.marker([pointer.geo.lat, pointer.geo.lng]);
			marker.addTo(map);
		}
	});
</script>

<div id="map" class="w-full h-96 rounded-lg" />
