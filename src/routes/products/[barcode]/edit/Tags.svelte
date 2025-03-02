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

<div class="input bg-base-100 flex w-full h-full min-h-12 flex-wrap gap-x-1.5 gap-y-1 rounded-md p-2 border-none shadow-none">

	{#each tags as tag}
		<span class="badge badge-ghost py-3 text-lg" transition:fade={{ duration: 100 }}>
			{tag}
			<button class="ml-2 text-xl" onclick={removeTag(tag)}>×</button>
		</span>
	{/each}
	<div class="dropdown grow">
		<input
			type="text"
			class="h-auto w-auto min-w-0 flex-shrink border-none bg-transparent outline-none"
			onkeydown={inputHandler}
			bind:value={newValue}
		/>

		{#if filteredAutocomplete.length > 0}
			<div class="dropdown-content max-h-52 overflow-y-auto">
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<ul tabindex="0" class="menu bg-base-100 border-none shadow-none">
					{#each filteredAutocomplete as suggestion}
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
