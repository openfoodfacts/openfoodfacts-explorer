<script lang="ts">
	import Card from '$lib/ui/Card.svelte';
	import { _ } from '$lib/i18n';
	import type { ProductDataSection } from '$lib/api';
	import { page } from '$app/state';

	type Props = {
		product: ProductDataSection;
	};

	let { product }: Props = $props();

	function formatUnixToDateString(unix: number | null | undefined): string {
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
		(product.states_hierarchy ?? [])
			.filter((state: string) => !state.includes('to-be-completed'))
			.map((state: string) => ({ key: state, label: formatState(state) }))
	);

	const toDoStates = $derived(
		(product.states_hierarchy ?? [])
			.filter((state: string) => state.includes('to-be-completed'))
			.map((state: string) => ({ key: state, label: formatState(state) }))
	);
</script>

{#snippet user(user: string | null)}
	<a href="/users/{user}" class="break-all underline">
		{user ?? $_('product.datasources.unknown')}
	</a>
{/snippet}

<Card>
	<h1 class="text-4xl font-bold">{$_('product.datasources.title')}</h1>

	<!-- Added -->
	<p class="mt-4 text-sm">
		<span class="text-gray-600 dark:text-gray-300">
			{$_('product.datasources.added_on', {
				values: { date: formatUnixToDateString(product.created_t) }
			})}
		</span>
		{@render user(product.creator)}
	</p>

	<!-- Last edit -->
	<p class="mt-2 text-sm">
		<span class="text-gray-600 dark:text-gray-300">
			{$_('product.datasources.last_edit', {
				values: { date: formatUnixToDateString(product.last_modified_t) }
			})}
		</span>
		{@render user(product.last_editor)}
	</p>

	<!-- Last check -->
	{#if product.checkers_tags && product.checkers_tags.length > 0}
		<p class="mt-2 text-sm">
			<span class="text-gray-600 dark:text-gray-300">
				{$_('product.datasources.last_check', {
					values: { date: formatUnixToDateString(product.last_checked_t) }
				})}
			</span>
			{@render user(product.checkers_tags[0])}
		</p>
	{/if}

	<!-- Editors -->
	{#if product.editors_tags && product.editors_tags.length > 1}
		<p class="mt-2 overflow-hidden text-sm break-words">
			<span class="text-gray-600 dark:text-gray-300">
				{$_('product.datasources.also_edited_by')}
			</span>

			{#each product.editors_tags as editor, i (i)}
				{#if i > 0},
				{/if}
				{@render user(editor)}
			{/each}
		</p>
	{/if}

	<!-- Checkers -->
	{#if product.checkers_tags && product.checkers_tags.length > 1}
		<p class="mt-2 text-sm">
			<span class="text-gray-600 dark:text-gray-300">
				{$_('product.datasources.also_checked_by')}
			</span>
			{#each product.checkers_tags.slice(1) as checker, i (i)}
				{#if i > 0},
				{/if}
				{@render user(checker)}
			{/each}
		</p>
	{/if}

	<a
		class="text-warning-content bg-warning mt-4 block p-3 text-center font-bold hover:shadow"
		href="{page.url.pathname}/edit"
	>
		{$_('product.datasources.incomplete_or_incorrect')}
	</a>

	<h3 class="mt-4 text-lg font-bold">{$_('product.datasources.states')}</h3>

	{#if doneStates.length > 0}
		<div class="mt-4 space-x-1">
			<p class="my-2 font-bold">{$_('product.datasources.done')}:</p>
			{#each doneStates as state, i (i)}
				<a href="/facets/states/{state.key}" class="badge badge-secondary"> {state.label}</a>
			{/each}
		</div>
	{/if}

	{#if toDoStates.length > 0}
		<div class="mt-4 space-x-1">
			<p class="my-2 font-bold">{$_('product.datasources.toDo')}:</p>
			{#each toDoStates as state, i (i)}
				<a href="/facets/states/{state.key}" class="badge badge-secondary"> {state.label}</a>
			{/each}
		</div>
	{/if}
</Card>
