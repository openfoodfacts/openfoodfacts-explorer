<script lang="ts">
	import type { KnowledgeElement, KnowledgePanel } from '$lib/api';

	import Element from './KnowledgeElement.svelte';

	export let allPanels: Record<string, KnowledgePanel>;
	export let elements: KnowledgeElement[];
</script>

{#each elements as element, i}
	{#if i > 0}
		<hr class="my-4 bg-base-100 border-base-100" />
	{/if}
	<Element {element} {allPanels} />
{/each}
