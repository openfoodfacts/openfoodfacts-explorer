<script lang="ts">
	import type { KnowledgeElementText } from '$lib/api';
	import { _ } from '$lib/i18n';

	let { element }: { element: KnowledgeElementText } = $props();

	let { type, edit_field_type, html, source_url, source_text, source_language } = $derived(
		element.text_element
	);
</script>

<div class="mb-2 flex items-center space-x-2">
	{#if type === 'warning'}
		<span class="badge badge-warning">{$_('general.warning')}</span>
	{:else if type === 'notes'}
		<span class="badge badge-info">{$_('general.notes')}</span>
	{:else if type === 'summary'}
		<span class="badge">{$_('general.summary')}</span>
	{/if}
</div>

<!-- Specialization for ingredients_text -->
{#if edit_field_type == 'ingredients_text'}
	<div class="prose w-full max-w-full dark:text-white">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</div>
{:else}
	<div class="prose w-full max-w-full dark:text-white">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</div>
{/if}

{#if source_url}
	<a class="link" href={source_url}>
		{source_text} ({source_language})
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

	:global(.text_info.unknown_ingredient) {
		background-color: #fff3cd;
		border-color: #ffeeba;
		color: #856404;
		padding: 0 0.2em;
		border-radius: 0.25em;
		font-weight: bold;
	}
	:global(.text_info.unknown_ingredient:hover) {
		background-color: #ffe8a1;
		border-color: #ffdd57;
		color: #856404;
		padding: 0 0.2em;
		border-radius: 0.25em;
		font-weight: bold;
		cursor: help;
	}
	:global(.text_info.unknown_ingredient:hover::after) {
		content: 'Unknown ingredient';
		font-size: 0.75em;
		font-weight: normal;
		position: absolute;
		background-color: var(--color-primary);
		color: var(--color-primary-content);
		padding: 0.2em 0.5em;
		border-radius: 0.25em;
		white-space: nowrap;
		margin-top: 1.5em;
		z-index: 10;
	}

	:global(.ordered_ingredients_list) {
		list-style-type: decimal;
		padding-left: 1.5em;
	}

	:global([id^='data-error-']) {
		font-weight: bold;
	}

	:global([id^='data-error-'] > .description) {
		font-style: italic;
		font-weight: normal;
	}
</style>
