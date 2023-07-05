<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	export let tags: string[] = [];

	export let autocomplete: string[] = [];

	let newValue: string = '';

	$: filteredAutocomplete =
		newValue.length < 3
			? []
			: autocomplete.filter((s) => s.toLowerCase().includes(newValue.toLowerCase()));

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

<div class="border flex flex-wrap gap-x-1.5 gap-y-1 p-2 rounded-md">
	{#each tags as tag}
		<span class="badge text-lg py-3" transition:fade={{ duration: 100 }}>
			{tag}
			<button class="ml-2 text-xl" on:click={removeTag(tag)}>×</button>
		</span>
	{/each}
	<div class="dropdown grow">
		<input
			type="text"
			class="w-full outline-none"
			on:keydown={inputHandler}
			bind:value={newValue}
		/>

		<div class="dropdown-content max-h-52 overflow-y-auto">
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul tabindex="0" class="menu bg-base-100 shadow-sm">
				{#each filteredAutocomplete as suggestion}
					<li>
						<button
							class="btn btn-ghost"
							on:click={() => {
								tags = [...tags, suggestion];
								dispatcher('change', { tags });
								newValue = '';
							}}
						>
							{suggestion}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
