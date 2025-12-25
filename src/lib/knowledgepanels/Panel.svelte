<script lang="ts">
	import { dev } from '$app/environment';

	import type { KnowledgeElement, KnowledgePanel, KnowledgeTitleElement } from '$lib/api';

	import Card from '$lib/ui/Card.svelte';
	import Element from './Element.svelte';

	type Props = {
		panels: Record<string, KnowledgePanel>;

		panel: KnowledgePanel;
		inline?: boolean;
		id: string;
		link?: string;
		productCode?: string;
	};
	let { panels, panel, inline = false, id, link, productCode }: Props = $props();

	let expanded = $derived(panel?.expanded ?? false);
</script>

{#snippet elementList(elements: KnowledgeElement[])}
	{#each elements as element, i (i)}
		<Element {element} {panels} {productCode} />
	{/each}
{/snippet}

{#snippet detailsElement(title: KnowledgeTitleElement, elements: KnowledgeElement[] = [])}
	<div
		class={[
			'border-base-300 collapse border',
			elements.length !== 0 ? 'collapse-arrow' : 'collapse-close',
			panel.size && `kp-panel-size-${panel.size}`,
			panel.evaluation && `kp-panel-eval-${panel.evaluation}`,
			panel.level && `kp-panel-level-${panel.level}`,
			'type' in title && `kp-panel-type-${title.type}`
		]}
	>
		<input type="checkbox" checked={expanded} />

		<div
			class={[
				'hover:bg-base-200 dark:hover:bg-base-100 collapse-title my-2 flex w-full cursor-pointer items-center p-2 select-none'
			]}
		>
			{#if title.icon_url != null}
				<img
					class={[
						'kp-icon mr-4 h-12',
						title.icon_size && `kp-icon-${title.icon_size}`,
						title.icon_color_from_evaluation && 'kp-icon-from-eval'
					]}
					src={title.icon_url}
					alt={title.title}
				/>
			{/if}
			<div class="grow">
				<div class="kp-title">{title.title}</div>
				{#if title.subtitle != null}
					<h3 class="kp-subtitle text-secondary text-sm italic">{title.subtitle}</h3>
				{/if}
			</div>
		</div>
		<div class="collapse-content">
			{#if elements}
				{@render elementList(elements)}
			{/if}
		</div>
	</div>
{/snippet}

<div {id}>
	{#if panel == null}
		{#if dev}
			<div class="alert alert-warning">Panel is null</div>
		{/if}
	{:else if panel.type === 'inline' || inline}
		{#if panel.elements != null}
			<div>{@render elementList(panel.elements)}</div>
		{/if}
	{:else if panel.type === 'card' && panel.title_element != null && panel.elements != null}
		<Card>
			<div class="flex items-center">
				<h2 class="my-3 grow text-2xl font-bold sm:text-4xl">{panel.title_element.title}</h2>
				{#if link != null}
					<a class="link" href={link}>Go back</a>
				{/if}
			</div>

			{@render elementList(panel.elements)}
		</Card>
	{:else if panel.title_element != null}
		{@render detailsElement(panel.title_element, panel.elements)}
	{:else if dev}
		<div class="alert alert-warning">Panel is missing title or elements</div>
		<pre class="break-all whitespace-pre-wrap">{JSON.stringify(panel, null, 2)}</pre>
	{/if}
</div>

<style lang="postcss">
	@reference '../../app.css';

	@media (prefers-color-scheme: dark) {
		.kp-icon-from-eval {
			@apply invert;
		}
	}

	.kp-icon-small {
		@apply h-6 w-6;
	}

	.kp-panel-size-small .kp-title {
		@apply text-sm;
	}
	.kp-panel-size-small .kp-subtitle {
		@apply text-xs;
	}

	.kp-panel-eval-good {
		@apply border-green-500;
	}
	.kp-panel-eval-good .kp-icon-from-eval.kp-icon {
		@apply text-green-500;
	}

	.kp-panel-eval-average {
		@apply border-yellow-500;
	}
	.kp-panel-eval-average .kp-icon-from-eval.kp-icon {
		@apply text-yellow-500;
	}

	.kp-panel-eval-unknown {
		@apply border-gray-500;
	}
	.kp-panel-eval-unknown .kp-icon-from-eval.kp-icon {
		@apply text-gray-500;
	}

	.kp-panel-eval-bad {
		@apply border-red-500;
	}
	.kp-panel-eval-bad .kp-icon-from-eval.kp-icon {
		@apply text-red-500;
	}

	.kp-panel-type-percentage .kp-title {
		@apply border-none;
	}
</style>
