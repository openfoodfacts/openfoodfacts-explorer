<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import Fuse from 'fuse.js';

	export let tags: string[] = [];

	export let autocomplete: readonly string[] = [];
	$: autoCompleteFuse = new Fuse(autocomplete, {
		threshold: 0.2
	});

	let newValue = '';

	$: filteredAutocomplete =
		newValue.length < 3 ? [] : autoCompleteFuse.search(newValue).slice(0, 10);

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
	class="input-bordered input h-auto flex flex-wrap gap-x-1.5 gap-y-1 p-2 rounded-md min-h-12 bg-base-100"
>
	{#each tags as tag}
		<span class="badge badge-ghost text-lg py-3" transition:fade={{ duration: 100 }}>
			{tag}
			<button class="ml-2 text-xl" on:click={removeTag(tag)}>×</button>
		</span>
	{/each}
	<div class="dropdown grow">
		<input
			type="text"
			class="w-full outline-none bg-transparent"
			on:keydown={inputHandler}
			bind:value={newValue}
		/>

		{#if filteredAutocomplete.length > 0}
			<div class="dropdown-content max-h-52 overflow-y-auto">
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<ul tabindex="0" class="menu bg-base-100 shadow-sm">
					{#each filteredAutocomplete as suggestion}
						{@const key = suggestion.item}
						<li>
							<button
								class="btn btn-ghost"
								on:click={() => {
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
