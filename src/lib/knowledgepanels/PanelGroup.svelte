<script lang="ts">
	import type { KnowledgePanel, KnowledgePanelGroupElement } from '$lib/api';
	import Panel from './Panel.svelte';


    export let element: KnowledgePanelGroupElement;
    export let allPanels: Record<string, KnowledgePanel>;

</script>

<div class="flex flex-col gap-4 md:flex-row">
    <div class="grow">
        <h3 class="my-3 text-xl font-bold">{element.panel_group_element.title}</h3>
        {#each element.panel_group_element.panel_ids as id}
            {@const panel = allPanels[id]}
            <Panel {panel} {allPanels} {id} />
        {/each}
    </div>

    {#if element.panel_group_element.image != null}
        <img
            class="max-w-96"
            src={element.panel_group_element.image.sizes['full'].url}
            alt={element.panel_group_element.image.alt}
        />
    {/if}
</div>
