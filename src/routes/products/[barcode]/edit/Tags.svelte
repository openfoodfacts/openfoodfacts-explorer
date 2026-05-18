<script lang="ts">
	import { fade } from 'svelte/transition';
	import Fuse from 'fuse.js';

	import IconMdiClose from '@iconify-svelte/mdi/close';

	type Props = {
		tags?: string[];
		autocomplete?: readonly string[];
		onChange?: (tags: string[]) => void;
	};

	let { tags = $bindable([]), autocomplete = [], onChange }: Props = $props();

	let autoCompleteFuse = $derived(new Fuse(autocomplete, { threshold: 0.2 }));
	let autoCompleteIndex = $state(-1);

	let newValue = $state('');
	let editingIndex = $state(-1);
	let editingValue = $state('');

	let filteredAutocomplete = $derived(
		newValue.length < 3 ? [] : autoCompleteFuse.search(newValue).slice(0, 10)
	);

	function inputHandler(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ',') {
			if (autoCompleteIndex !== -1) {
				newValue = filteredAutocomplete[autoCompleteIndex].item;
			}

			const tag = newValue.trim();

			newValue = '';
			event.preventDefault();

			addTag(tag);
		} else if (newValue.length === 0 && event.key === 'Backspace') {
			tags = tags.slice(0, -1);
			onChange?.(tags);
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (autoCompleteIndex === -1) {
				autoCompleteIndex = 0;
			} else if (autoCompleteIndex < filteredAutocomplete.length - 1) {
				autoCompleteIndex += 1;
			}
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (autoCompleteIndex === -1) {
				autoCompleteIndex = filteredAutocomplete.length - 1;
			} else if (autoCompleteIndex > 0) {
				autoCompleteIndex -= 1;
			}
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
	}

	function saveEdit(index: number) {
		const trimmedValue = editingValue.trim();
		if (trimmedValue !== '' && trimmedValue !== tags[index]) {
			tags = tags.map((tag, i) => (i === index ? trimmedValue : tag));
			onChange?.(tags);
		}
		editingIndex = -1;
		editingValue = '';
	}

	function cancelEdit() {
		editingIndex = -1;
		editingValue = '';
	}

	function handleEditKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Enter') {
			event.preventDefault();
			saveEdit(index);
		} else if (event.key === 'Escape') {
			event.preventDefault();
			cancelEdit();
		}
	}

	function focus(element: HTMLInputElement) {
		element.focus();
		element.select();
	}
</script>

<div
	class="bg-base-100 border-base-200 focus-within:border-primary focus-within:outline-primary flex h-auto min-h-12 w-full flex-wrap items-center gap-x-1.5 gap-y-1 rounded-md p-2"
>
	{#each tags as tag, index (tag)}
		<div class="badge badge-ghost flex h-min items-center py-2" transition:fade={{ duration: 100 }}>
			{#if editingIndex === index}
				<input
					type="text"
					class=" input w-full min-w-0 border bg-transparent outline-none"
					bind:value={editingValue}
					onkeydown={(e) => handleEditKeydown(e, index)}
					onblur={() => saveEdit(index)}
					use:focus
				/>
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
		{#if filteredAutocomplete.length > 0}
			<div
				class="dropdown-content bg-base-00 z-10 mt-1 w-full rounded-md shadow-lg focus:outline-none"
			>
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<ul tabindex="0" class="divide-base-100 divide-y">
					{#each filteredAutocomplete as suggestion, index (suggestion.item)}
						{@const key = suggestion.item}
						<li>
							<button
								type="button"
								class="bg-base-200 text-base-content hover:bg-primary hover:text-primary-content focus:bg-primary focus:text-primary-content w-full rounded-md px-4 py-2 text-left transition-colors duration-150"
								class:bg-primary={autoCompleteIndex === index}
								class:text-primary-content={autoCompleteIndex === index}
								onclick={(e) => {
									e.preventDefault();
									newValue = '';
									addTag(key);
								}}
							>
								<span class="block truncate">{key}</span>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</div>
