<script lang="ts">
	import type { KnowledgePanel } from '$lib/api';

	import Elements from './Elements.svelte';
	import Card from '$lib/ui/Card.svelte';
	import { dev } from '$app/environment';
	import Debug from '$lib/ui/Debug.svelte';

	export let allPanels: Record<string, KnowledgePanel>;
	export let panel: KnowledgePanel | null;
	export let id: string;
	export let link: string | undefined = undefined;

	let expanded = panel?.expanded ?? false;
</script>

<div {id}>
	{#if panel == null}
		<div class="alert alert-warning">Panel is null</div>
	{:else if panel.type === 'card'}
		<Card>
			<div class="flex items-center">
				<h2 class="my-3 flex-grow text-4xl font-bold">{panel.title_element.title}</h2>
				{#if link != null}
					<a class="link" href={link}>Go back</a>
				{/if}
			</div>

			<Elements elements={panel.elements} {allPanels} />
		</Card>
	{:else if panel.type === 'inline'}
		{#if panel.elements != null}
			<div class="pl-4">
				<Elements elements={panel.elements} {allPanels} />
			</div>
		{/if}
	{:else}
		<details
			bind:open={expanded}
			class:border-l-secondary={expanded}
			class:border-l-2={expanded}
			class:pl-2={expanded}
		>
			<summary
				class="my-2 flex w-full cursor-pointer select-none items-center rounded-lg p-2 hover:bg-base-200 dark:hover:bg-base-100"
			>
				{#if panel.title_element != null}
					{#if panel.title_element.icon_url != null}
						{#if panel.title_element.type === 'grade'}
							<img
								class="mr-4 h-12"
								src={panel.title_element.icon_url}
								alt={panel.title_element.title}
							/>
						{:else}
							<img
								class="mr-4 h-8 w-8 rounded-md bg-white object-contain"
								src={panel.title_element.icon_url}
								alt={panel.title_element.title}
							/>
						{/if}
					{/if}

					<div class="grow text-xl">
						<div>{panel.title_element.title}</div>
						{#if panel.title_element.subtitle != null}
							<h3 class="text-sm italic text-secondary">{panel.title_element.subtitle}</h3>
						{/if}
					</div>
				{/if}
			</summary>
			{#if panel.elements != null}
				<div class="pl-4">
					<Elements elements={panel.elements} {allPanels} />
				</div>
			{/if}
		</details>
	{/if}

	{#if dev}
		<Debug data={panel} />
	{/if}
</div>
