<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import Fuse from 'fuse.js';

	interface Props {
		tags?: string[];
		autocomplete?: readonly string[];
	}

	let { tags = $bindable([]), autocomplete = [] }: Props = $props();
	let autoCompleteFuse = $derived(
		new Fuse(autocomplete, {
			threshold: 0.2
		})
	);

	let newValue = $state('');
	let editingIndex = $state(-1);
	let editingValue = $state('');

	let filteredAutocomplete = $derived(
		newValue.length < 3 ? [] : autoCompleteFuse.search(newValue).slice(0, 10)
	);

	function inputHandler(event: KeyboardEvent) {
		if (newValue.length !== 1 && (event.key === 'Enter' || event.key === ',')) {
			tags = [...tags, newValue.trim()];
			newValue = '';
			event.preventDefault();
			dispatcher('change', { tags });
		} else if (newValue.length === 0 && event.key === 'Backspace') {
			tags = tags.slice(0, -1);
			dispatcher('change', { tags });
		}
	}

	function removeTag(tag: string) {
		tags = tags.filter((t) => t !== tag);
		dispatcher('change', { tags });
	}

	function startEditing(index: number, tag: string) {
		editingIndex = index;
		editingValue = tag;
	}

	function saveEdit(index: number) {
		const trimmedValue = editingValue.trim();
		if (trimmedValue !== '' && trimmedValue !== tags[index]) {
			tags = tags.map((tag, i) => (i === index ? trimmedValue : tag));
			dispatcher('change', { tags });
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

	const dispatcher = createEventDispatcher<{
		change: { tags: string[] };
	}>();
</script>

<div
	class="bg-base-100 border-base-200 focus-within:border-primary focus-within:outline-primary flex h-auto min-h-12 w-full flex-wrap gap-x-1.5 gap-y-1 rounded-md p-2"
>
	{#each tags as tag, index (tag)}
		<span class="badge badge-ghost overflow-hidden py-3" transition:fade={{ duration: 100 }}>
			{#if editingIndex === index}
				<input
					type="text"
					class="w-full min-w-0 bg-transparent outline-none"
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
			<button class="ml-1 text-xl" onclick={() => removeTag(tag)}>×</button>
		</span>
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
					{#each filteredAutocomplete as suggestion (suggestion.item)}
						{@const key = suggestion.item}
						<li>
							<button
								type="button"
								class="bg-base-200 text-base-content hover:bg-primary hover:text-primary-content focus:bg-primary focus:text-primary-content w-full rounded-md px-4 py-2 text-left transition-colors duration-150"
								onclick={() => {
									tags = [...tags, key];
									dispatcher('change', { tags });
									newValue = '';
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
