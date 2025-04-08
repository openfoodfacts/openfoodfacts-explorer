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
		return () => {
			tags = tags.filter((t) => t !== tag);
			dispatcher('change', { tags });
		};
	}

	const dispatcher = createEventDispatcher<{
		change: { tags: string[] };
	}>();
</script>

<div
	class="input input-bordered bg-base-100 h-auto min-h-12 w-full flex-wrap gap-x-1.5 gap-y-1 rounded-md p-2"
>
	{#each tags as tag (tag)}
		<span class="badge badge-ghost overflow-hidden py-3" transition:fade={{ duration: 100 }}>
			<span class="truncate">{tag}</span>
			<button class="ml-1 text-xl" onclick={removeTag(tag)}>×</button>
		</span>
	{/each}
	<div class="dropdown grow">
		<input
			type="text"
			class="w-full bg-transparent outline-hidden"
			onkeydown={inputHandler}
			bind:value={newValue}
		/>
		{#if filteredAutocomplete.length > 0}
			<div class="dropdown-content">
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<ul tabindex="0" class="menu bg-base-100 shadow-xs">
					{#each filteredAutocomplete as suggestion (suggestion.item)}
						{@const key = suggestion.item}
						<li>
							<button
								class="btn btn-ghost"
								onclick={() => {
									tags = [...tags, key];
									dispatcher('change', { tags });
									newValue = '';
								}}
							>
								{key}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</div>
