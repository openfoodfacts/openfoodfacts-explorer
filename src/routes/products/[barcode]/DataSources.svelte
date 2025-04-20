<script lang="ts">
	import Card from '$lib/ui/Card.svelte';
	import { _ } from '$lib/i18n';
	import type { ProductDataSection } from '$lib/api';

	type Props = {
		product: ProductDataSection;
	};

	const { product }: Props = $props();

	function formatUnixToDateString(unix: number) {
		if (unix == null || unix === undefined || Number.isNaN(unix)) {
			return $_('product.datasources.unknown');
		}
		const date = new Date(unix * 1000);
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
			timeZoneName: 'short'
		};

		const userLanguage = navigator.language || 'en-GB';
		return new Intl.DateTimeFormat(userLanguage, options).format(date);
	}

	function formatState(state: string): string {
		if (state.startsWith('en:')) {
			state = state.slice(3);
		}
		return state.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
	}

	const doneStates = $derived(
		product.states_hierarchy
			.filter((state: string) => !state.includes('to-be-completed'))
			.map((state: string) => formatState(state))
	);

	const toDoStates = $derived(
		product.states_hierarchy
			.filter((state: string) => state.includes('to-be-completed'))
			.map((state: string) => formatState(state))
	);
</script>

<Card>
	<h1 class="text-4xl font-bold">{$_('product.datasources.title')}</h1>
	<p class="mt-4 text-sm">
		<span class="text-gray-600 dark:text-gray-300">
			{$_('product.datasources.added_on', {
				values: { date: formatUnixToDateString(product.created_t) }
			})}
		</span>
		<span class="break-all underline">{product.creator ?? $_('product.datasources.unknown')}</span>
	</p>

	<p class="mt-2 text-sm">
		<span class="text-gray-600 dark:text-gray-300">
			{$_('product.datasources.last_edit', {
				values: { date: formatUnixToDateString(product.last_modified_t) }
			})}
		</span>
		<span class="break-all underline">
			{product.last_editor ?? $_('product.datasources.unknown')}
		</span>
	</p>

	<p class="mt-2 overflow-hidden text-sm break-words">
		<span class="text-gray-600 dark:text-gray-300">
			{$_('product.datasources.also_edited_by')}
		</span>

		{#if product.editors_tags.length === 0}
			<span class="underline">{$_('product.datasources.unknown')}</span>
		{:else}
			{#each product.editors_tags as editor, i (i)}
				<span class="break-all underline"> {editor} </span>
				{#if i < product.editors_tags.length - 1}, &nbsp;
				{/if}
			{/each}
		{/if}
	</p>

	<p class="mt-2 text-sm">
		<span class="text-gray-600 dark:text-gray-300">
			{$_('product.datasources.last_check', {
				values: { date: formatUnixToDateString(product.last_checked_t) }
			})}
		</span>
		<span class="break-all underline">
			{product.checkers_tags[0] ?? $_('product.datasources.unknown')}
		</span>
	</p>

	<div class="divider"></div>

	<div class="bg-secondary mt-4 rounded-xl p-3">
		<p class="invert">{$_('product.datasources.incomplete_or_incorrect')}</p>
	</div>

	<div class="divider"></div>

	{#if doneStates.length > 0}
		<div class="mt-4 space-x-1">
			<span class="font-bold">{$_('product.datasources.done')}:</span>
			{#each doneStates as state, i (i)}
				<span class="badge badge-secondary badge-sm"> {state}</span>
			{/each}
		</div>
	{/if}

	{#if toDoStates.length > 0}
		<div class="mt-4 space-x-1">
			<span class="font-bold">{$_('product.datasources.toDo')}:</span>
			{#each toDoStates as state, i (i)}
				<span class="badge badge-secondary badge-sm"> {state}</span>
			{/each}
		</div>
	{/if}
</Card>
