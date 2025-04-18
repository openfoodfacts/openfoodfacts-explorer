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
			return $_('product.preferences.unknown');
		}
		const date = new Date(unix * 1000);
		const options = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
			timeZoneName: 'short'
		} as const;

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
	<h1 class="text-4xl font-bold">Data sources</h1>
	<p class="mt-4 text-sm">
		<span class="text-gray-600 dark:text-gray-300">
			{$_('product.preferences.added_on')}
			{formatUnixToDateString(product.created_t)}
			{$_('product.preferences.by')}
		</span>
		<span class="underline">{product.creator ?? $_('product.preferences.unknown')}</span>
	</p>

	<p class="text-sm">
		<span class="text-gray-600 dark:text-gray-300"
			>{$_('product.preferences.last_edit')}
			{formatUnixToDateString(product.last_modified_t)}
			{$_('product.preferences.by')}</span
		>
		<span class="underline">{product.last_editor ?? $_('product.preferences.unknown')}</span>
	</p>

	<p class="text-sm">
		<span class="text-gray-600 dark:text-gray-300">{$_('product.preferences.also_edited_by')}</span>
		{#if product.editors_tags.length === 0}
			<span class="underline">{$_('product.preferences.unknown')}</span>
		{:else}
			{#each product.editors_tags as editor, i (i)}
				<span class="underline"> {String(editor)}</span>{#if i < product.editors_tags.length - 1},
					&nbsp;
				{/if}
			{/each}
		{/if}
	</p>

	<p class="text-sm">
		<span class="text-gray-600 dark:text-gray-300">
			{$_('product.preferences.last_check')}
			{formatUnixToDateString(product.last_checked_t)}
			{$_('product.preferences.by')}</span
		>
		<span class="underline"> {product.checkers_tags[0] ?? $_('product.preferences.unknown')}</span>
	</p>

	<div class="bg-secondary mt-4 p-3">
		<p class="invert">{$_('product.preferences.incomplete_or_incorrect')}</p>
	</div>

	{#if doneStates.length > 0}
		<div class="mt-4">
			<span class="font-bold">{$_('product.preferences.done')}:</span>
			{doneStates.join(', ')}
		</div>
	{/if}

	{#if toDoStates.length > 0}
		<div class="mt-4">
			<span class="font-bold">{$_('product.preferences.toDo')}:</span>
			{toDoStates.join(', ')}
		</div>
	{/if}
</Card>
