<script lang="ts">
	import type { KnowledgeTextElement } from '$lib/api';

	let { element }: { element: KnowledgeTextElement } = $props();

	let text_el = $derived(element.text_element);
	let type = $derived(text_el.type);
</script>

{#if type === 'warning'}
	<span class="badge badge-warning">Warning</span>
{:else if type === 'notes'}
	<span class="badge badge-info">Notes</span>
{:else if type === 'summary'}
	<span class="badge">Summary</span>
{/if}

<!-- Specialization for ingredients_text -->
{#if text_el.edit_field_type == 'ingredients_text'}
	<div class="prose w-full max-w-full dark:text-white">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html text_el.html}
	</div>
{:else}
	<div class="prose w-full max-w-full dark:text-white">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html text_el.html}
	</div>
{/if}

{#if text_el.source_url}
	<a class="link" href={text_el.source_url}>
		{text_el.source_text} ({text_el.source_language})
	</a>
{/if}

<style>
	:global(.allergen) {
		background-color: #f8d7da;
		border-color: #f5c6cb;
		color: #721c24;
		padding: 0 0.2em;
		border-radius: 0.25em;
		font-weight: bold;
	}
</style>
