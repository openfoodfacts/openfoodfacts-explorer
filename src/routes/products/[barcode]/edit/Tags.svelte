<script lang="ts">
	import { fade } from 'svelte/transition';
	import Fuse from 'fuse.js';

	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiAlert from '@iconify-svelte/mdi/alert';

	type Props = {
		tags?: string[];
		autocomplete?: readonly string[];
		onChange?: (tags: string[]) => void;
		highlightEmpty?: boolean;
		highlightSeverity?: 'error' | 'warning' | 'info' | '';
		highlightMessage?: string;
	};

	let {
		tags = $bindable([]),
		autocomplete = [],
		onChange,
		highlightEmpty = false,
		highlightSeverity = '',
		highlightMessage = ''
	}: Props = $props();

	let autoCompleteFuse = $derived(new Fuse(autocomplete, { threshold: 0.2 }));
	let autoCompleteIndex = $state(-1);

	let newValue = $state('');
	let editingIndex = $state(-1);
	let editingValue = $state('');

	// Track active search value (newValue for additions, editingValue for inline edits)
	let activeSearchValue = $derived(editingIndex === -1 ? newValue : editingValue);

	let filteredAutocomplete = $derived(
		activeSearchValue.length < 3 ? [] : autoCompleteFuse.search(activeSearchValue).slice(0, 10)
	);

	// Reactive bounds check: reset suggestion index to -1 if list shrinks under it
	$effect(() => {
		if (autoCompleteIndex >= filteredAutocomplete.length) {
			autoCompleteIndex = -1;
		}
	});

	// Handle arrow key navigation within the autocomplete suggestions
	function handleNavigationKeys(event: KeyboardEvent): boolean {
		if (filteredAutocomplete.length === 0) return false;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (autoCompleteIndex === -1) {
				autoCompleteIndex = 0;
			} else if (autoCompleteIndex < filteredAutocomplete.length - 1) {
				autoCompleteIndex += 1;
			}
			return true;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (autoCompleteIndex === -1) {
				autoCompleteIndex = filteredAutocomplete.length - 1;
			} else if (autoCompleteIndex > 0) {
				autoCompleteIndex -= 1;
			}
			return true;
		}
		return false;
	}

	function inputHandler(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ',') {
			if (autoCompleteIndex !== -1 && filteredAutocomplete[autoCompleteIndex]) {
				newValue = filteredAutocomplete[autoCompleteIndex].item;
			}

			const tag = newValue.trim();

			newValue = '';
			autoCompleteIndex = -1;
			event.preventDefault();

			addTag(tag);
		} else if (newValue.length === 0 && event.key === 'Backspace') {
			tags = tags.slice(0, -1);
			onChange?.(tags);
		} else {
			handleNavigationKeys(event);
		}
	}

	function addTag(tag: string) {
		if (tags.includes(tag)) {
			console.warn(`Tag "${tag}" already exists.`);
			return;
		}
		tags = [...tags, tag];
		onChange?.(tags);
	}

	function removeTag(tag: string) {
		tags = tags.filter((t) => t !== tag);
		onChange?.(tags);
	}

	function startEditing(index: number, tag: string) {
		editingIndex = index;
		editingValue = tag;
		autoCompleteIndex = -1;
	}

	function saveEdit(index: number) {
		const trimmedValue = editingValue.trim();
		if (trimmedValue !== '' && trimmedValue !== tags[index]) {
			tags = tags.map((tag, i) => (i === index ? trimmedValue : tag));
			onChange?.(tags);
		}
		editingIndex = -1;
		editingValue = '';
		autoCompleteIndex = -1;
	}

	function cancelEdit() {
		editingIndex = -1;
		editingValue = '';
		autoCompleteIndex = -1;
	}

	function handleEditKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Enter') {
			if (autoCompleteIndex !== -1 && filteredAutocomplete[autoCompleteIndex]) {
				editingValue = filteredAutocomplete[autoCompleteIndex].item;
				autoCompleteIndex = -1;
				event.preventDefault();
				return;
			}
			event.preventDefault();
			saveEdit(index);
		} else if (event.key === 'Escape') {
			event.preventDefault();
			cancelEdit();
		} else {
			handleNavigationKeys(event);
		}
	}

	// Handle selection of a suggestion from the autocomplete dropdown list
	function selectSuggestion(key: string) {
		if (editingIndex !== -1) {
			editingValue = key;
			const idx = editingIndex;
			setTimeout(() => saveEdit(idx), 0);
		} else {
			newValue = '';
			autoCompleteIndex = -1;
			addTag(key);
		}
	}

	function focus(element: HTMLInputElement) {
		element.focus();
		element.select();
	}
</script>

{#snippet autocompleteDropdown()}
	{#if filteredAutocomplete.length > 0}
		<div
			class="dropdown-content bg-base-100 z-100 mt-1 w-full rounded-md shadow-lg focus:outline-none"
		>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ul tabindex="0" class="divide-base-200 divide-y">
				{#each filteredAutocomplete as suggestion, index (suggestion.item)}
					{@const key = suggestion.item}
					<li>
						<button
							type="button"
							class="bg-base-200 text-base-content hover:bg-primary hover:text-primary-content focus:bg-primary focus:text-primary-content w-full rounded-md px-4 py-2 text-left transition-colors duration-150"
							class:bg-primary={autoCompleteIndex === index}
							class:text-primary-content={autoCompleteIndex === index}
							onmousedown={(e) => {
								// Use mousedown instead of click to fire selectSuggestion before the input's blur event
								e.preventDefault();
								selectSuggestion(key);
							}}
						>
							<span class="block truncate">{key}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
{/snippet}

<div
	class="bg-base-100 border-base-200 focus-within:border-primary focus-within:outline-primary flex h-auto min-h-12 w-full flex-wrap items-center gap-x-1.5 gap-y-1 rounded-md p-2 transition-all {highlightEmpty &&
	tags.length === 0
		? 'border-dashed border-warning/50 bg-warning/5'
		: ''} {highlightSeverity === 'error'
		? 'border-error'
		: highlightSeverity === 'warning'
			? 'border-warning'
			: highlightSeverity === 'info'
				? 'border-info'
				: ''}"
>
	{#each tags as tag, index (tag)}
		<div class="badge badge-ghost flex h-min items-center py-2" transition:fade={{ duration: 100 }}>
			{#if editingIndex === index}
				<div class="dropdown">
					<input
						type="text"
						class="input w-full min-w-0 border bg-transparent outline-none"
						bind:value={editingValue}
						onkeydown={(e) => handleEditKeydown(e, index)}
						onblur={() => {
							setTimeout(() => {
								if (editingIndex === index) saveEdit(index);
							}, 150);
						}}
						use:focus
					/>
					{@render autocompleteDropdown()}
				</div>
			{:else}
				<span
					class="cursor-pointer truncate"
					ondblclick={() => startEditing(index, tag)}
					title="Double-click to edit"
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							startEditing(index, tag);
						}
					}}
				>
					{tag}
				</span>
			{/if}
			<button
				class="hover:bg-base-300 ml-1 cursor-pointer p-1 leading-0"
				onclick={() => removeTag(tag)}
				aria-label={`Remove tag "${tag}"`}
			>
				<IconMdiClose class="h-4 w-4" />
			</button>
		</div>
	{/each}

	<div class="dropdown grow">
		<input
			type="text"
			class="input input-bordered w-full bg-transparent outline-hidden"
			onkeydown={inputHandler}
			bind:value={newValue}
		/>
		{@render autocompleteDropdown()}
	</div>
</div>
{#if highlightSeverity}
	{@const colorClass =
		highlightSeverity === 'error'
			? 'text-error'
			: highlightSeverity === 'warning'
				? 'text-warning'
				: 'text-info'}
	<span class="text-xs {colorClass} mt-1 font-medium flex items-center gap-1 w-full">
		<IconMdiAlert class="h-3.5 w-3.5 shrink-0" />
		{highlightMessage || 'Quality issue'}
	</span>
{:else if highlightEmpty && tags.length === 0}
	<span class="text-xs text-warning/70 mt-1 font-medium flex items-center gap-1 w-full">
		<IconMdiAlert class="h-3.5 w-3.5 shrink-0" />
		Missing info
	</span>
{/if}
