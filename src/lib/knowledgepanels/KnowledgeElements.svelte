<script lang="ts">
	import type { KnowledgeElement, KnowledgePanel } from '$lib/product';
	import Element from './KnowledgeElement.svelte';

	export let allPanels: Record<string, KnowledgePanel>;
	export let elements: KnowledgeElement[];
</script>

{#each elements as element}
	<Element {element} {allPanels} />
{/each}
