<script lang="ts">
	import { dev } from '$app/environment';

	import type { KnowledgeElement, KnowledgePanel, KnowledgePanelTitle } from '$lib/api';

	import Card from '$lib/ui/Card.svelte';
	import Debug from '$lib/ui/Debug.svelte';
	import Element from './Element.svelte';

	type Props = {
		allPanels: Record<string, KnowledgePanel>;

		panel: KnowledgePanel;
		id: string;
		link?: string;
		productCode?: string;
	};
	let { allPanels, panel, id, link, productCode }: Props = $props();

	let expanded = $state(panel?.expanded ?? false);
</script>

{#snippet elementList(elements: KnowledgeElement[])}
	{#each elements as element, i (i)}
		{#if i > 0}
			<hr class="border-base-100 bg-base-100 my-2" />
		{/if}
		<Element {element} {allPanels} {productCode} />
	{/each}
{/snippet}

{#snippet detailsElement(title: KnowledgePanelTitle, elements: KnowledgeElement[])}
	<details
		bind:open={expanded}
		class:border-l-secondary={expanded}
		class:border-l-2={expanded}
		class:pl-4={expanded}
	>
		<summary
			class="hover:bg-base-200 dark:hover:bg-base-100 my-2 flex w-full cursor-pointer items-center rounded-lg p-2 select-none"
		>
			{#if title != null}
				{#if title.icon_url != null}
					{#if title.type === 'grade'}
						<img class="mr-4 h-12" src={title.icon_url} alt={title.title} />
					{:else}
						<img
							class="mr-8 w-8 rounded-md bg-white object-contain"
							src={title.icon_url}
							alt={title.title}
						/>
					{/if}
				{/if}

				<div class="grow sm:text-xl">
					<div>{title.title}</div>
					{#if title.subtitle != null}
						<h3 class="text-secondary text-sm italic">{title.subtitle}</h3>
					{/if}
				</div>
			{/if}
		</summary>

		{#if elements != null}
			{@render elementList(panel.elements)}
		{/if}
	</details>
{/snippet}

<div {id}>
	{#if panel == null}
		{#if dev}
			<div class="alert alert-warning">Panel is null</div>
		{/if}
	{:else if panel.type === 'card'}
		<Card>
			<div class="flex items-center">
				<h2 class="my-3 grow text-2xl font-bold sm:text-4xl">{panel.title_element.title}</h2>
				{#if link != null}
					<a class="link" href={link}>Go back</a>
				{/if}
			</div>

			{@render elementList(panel.elements)}
		</Card>
	{:else if panel.type === 'inline'}
		{#if panel.elements != null}
			<div class="border-l-secondary border-l-2 pl-4">
				{@render elementList(panel.elements)}
			</div>
		{/if}
	{:else}
		{@render detailsElement(panel.title_element, panel.elements)}
	{/if}

	{#if dev}
		<Debug data={panel} />
	{/if}
</div>
