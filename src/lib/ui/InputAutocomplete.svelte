<script lang="ts" generics="T extends Record<string, string | number | boolean | null | undefined>">
	import { _ } from '$lib/i18n';
	import IconMdiPlus from '@iconify-svelte/mdi/plus';
	import IconMdiSearch from '@iconify-svelte/mdi/search';
	import type { ComponentType } from 'svelte';

	interface Props {
		items: T[];
		searchKeys: (keyof T)[];
		placeholder: string;
		onselect: (item: T) => void;
		buttonTitle?: string;
		buttonAriaLabel?: string;
		Icon?: ComponentType;
		inline?: boolean;
	}

	let {
		items,
		searchKeys,
		placeholder,
		onselect,
		buttonTitle = $_('product.edit.add_language', { default: 'Add a language' }),
		buttonAriaLabel = $_('product.edit.add_language', { default: 'Add a language' }),
		Icon = IconMdiPlus,
		inline = false
	}: Props = $props();

	let searchQuery = $state('');
	let autoCompleteIndex = $state(-1);
	let showInput = $state(false);

	function matchesSearchQuery(item: T, query: string, keys: (keyof T)[]): boolean {
		const lowerQuery = query.toLowerCase();
		return keys.some((key) => {
			const val = item[key];
			return typeof val === 'string' && val.toLowerCase().includes(lowerQuery);
		});
	}

	let filteredItems = $derived(
		searchQuery.length === 0
			? inline
				? items
				: []
			: items.filter((item: T) => matchesSearchQuery(item, searchQuery, searchKeys)).slice(0, 10)
	);

	$effect(() => {
		// Reset highlighted index when search query changes
		const _ = searchQuery;
		autoCompleteIndex = -1;
	});

	let resultsContainer = $state<HTMLElement>();

	// Scroll the highlighted suggestion into view during keyboard navigation
	$effect(() => {
		if (autoCompleteIndex !== -1 && resultsContainer) {
			const activeEl = resultsContainer.querySelector('.bg-primary');
			if (activeEl) {
				activeEl.scrollIntoView({ block: 'nearest' });
			}
		}
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			let selected = null;
			if (autoCompleteIndex !== -1 && filteredItems[autoCompleteIndex]) {
				selected = filteredItems[autoCompleteIndex];
			} else if (filteredItems.length > 0) {
				selected = filteredItems[0];
			}

			if (selected) {
				onselect(selected);
				searchQuery = '';
				autoCompleteIndex = -1;
				showInput = false;
			}
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (autoCompleteIndex === -1) {
				autoCompleteIndex = 0;
			} else if (autoCompleteIndex < filteredItems.length - 1) {
				autoCompleteIndex += 1;
			}
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (autoCompleteIndex === -1) {
				autoCompleteIndex = filteredItems.length - 1;
			} else if (autoCompleteIndex > 0) {
				autoCompleteIndex -= 1;
			}
		} else if (event.key === 'Escape') {
			searchQuery = '';
			autoCompleteIndex = -1;
			showInput = false;
		}
	}
</script>

{#if !inline && !showInput}
	<button
		type="button"
		class="btn ml-2 btn-circle btn-primary btn-sm"
		onclick={() => (showInput = true)}
		title={buttonTitle}
		aria-label={buttonAriaLabel}
	>
		<Icon class="h-5 w-5" />
	</button>
{:else}
	{#snippet listItem(item: T, idx: number)}
		<li>
			<button
				type="button"
				class="w-full cursor-pointer bg-base-100 px-4 py-2 text-left text-xs text-base-content transition-colors duration-150 hover:bg-primary hover:text-primary-content focus:bg-primary focus:text-primary-content sm:text-sm"
				class:bg-primary={autoCompleteIndex === idx}
				class:text-primary-content={autoCompleteIndex === idx}
				onclick={(e) => {
					e.preventDefault();
					onselect(item);
					searchQuery = '';
					autoCompleteIndex = -1;
					showInput = false;
				}}
			>
				<span
					>{item.locale || item.name} ({item.en}){#if item.code}
						- {item.code}{/if}</span
				>
			</button>
		</li>
	{/snippet}

	<div class={inline ? 'w-full' : 'dropdown relative ml-2 max-w-xs grow'}>
		<label
			class={inline
				? 'input mt-2 w-full text-sm sm:text-base'
				: 'input flex w-full items-center gap-2 input-sm'}
		>
			{#if inline}
				<IconMdiSearch class="h-5 w-5 opacity-70" />
			{:else}
				<Icon class="h-4 w-4 opacity-70" />
			{/if}
			<!-- svelte-ignore a11y_autofocus -->
			<input
				type="text"
				{placeholder}
				bind:value={searchQuery}
				onkeydown={handleKeyDown}
				onblur={() => {
					if (!inline) {
						setTimeout(() => {
							showInput = false;
							searchQuery = '';
						}, 200);
					}
				}}
				autofocus={!inline}
				class="grow text-xs sm:text-sm"
			/>
		</label>
		{#if inline}
			{#if filteredItems.length === 0}
				<p class="mt-4 text-center text-sm opacity-70 sm:text-base">
					{$_('product.edit.no_languages_found')}
				</p>
			{:else}
				<div
					bind:this={resultsContainer}
					class="mt-2 max-h-60 divide-y divide-base-100/10 overflow-y-auto"
				>
					{#each filteredItems as item, idx (item.code || idx)}
						<button
							type="button"
							class="btn h-auto w-full justify-start btn-ghost py-2 text-left text-xs font-normal normal-case btn-sm sm:text-sm"
							class:bg-primary={autoCompleteIndex === idx}
							class:text-primary-content={autoCompleteIndex === idx}
							onclick={() => {
								onselect(item);
								searchQuery = '';
							}}
						>
							{item.locale || item.name} ({item.en}){#if item.code}
								- {item.code}{/if}
						</button>
					{/each}
				</div>
			{/if}
		{:else if searchQuery.length > 0 && filteredItems.length > 0}
			<div
				class="dropdown-content z-10 mt-1 w-full rounded-md border border-base-300 bg-base-200 shadow-lg focus:outline-none"
			>
				<ul bind:this={resultsContainer} class="max-h-60 divide-y divide-base-100 overflow-y-auto">
					{#each filteredItems as item, idx (item.code || idx)}
						{@render listItem(item, idx)}
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{/if}
