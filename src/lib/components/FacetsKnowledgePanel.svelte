<script lang="ts">
	import { onMount } from 'svelte';

	export let barcode: string;
	export let lang: string = 'en';
	export let country: string = 'world';
	export let knowledgePanels: string[] = [
		'nutrition',
		'ingredients',
		'allergens',
		'labels',
		'categories',
		'brands',
		'packaging',
		'origins',
		'ecoscore',
		'nova'
	];

	interface FacetsKnowledgePanelsElement extends HTMLElement {
		barcode: string;
		lang: string;
		country: string;
		knowledgePanels: string[];
	}

	let element: FacetsKnowledgePanelsElement;

	onMount(() => {
		// Initialize the web component with the provided props
		if (element) {
			element.barcode = barcode;
			element.lang = lang;
			element.country = country;
			element.knowledgePanels = knowledgePanels;
		}
	});
</script>

<facets-knowledge-panels
	bind:this={element}
	class="w-full"
	style="--off-facets-knowledge-panels-primary-color: hsl(var(--p)); --off-facets-knowledge-panels-secondary-color: hsl(var(--s));"
></facets-knowledge-panels>

<style>
	facets-knowledge-panels {
		width: 100%;
	}
</style>
