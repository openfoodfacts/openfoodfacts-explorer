<script lang="ts">
	import Card from '$lib/ui/Card.svelte';
	export let product: any;

	function convertToCET(unix: number) {
        if (!unix || isNaN(unix)){
            return 'unknown';
        }
		const date = new Date(unix * 1000);
		const options = {
			timeZone: 'Europe/Paris',
			year: 'numeric' as 'numeric',
			month: 'long' as 'long' | 'numeric' | '2-digit',
			day: 'numeric' as 'numeric' | '2-digit',
			hour: '2-digit' as 'numeric' | '2-digit',
			minute: '2-digit' as 'numeric' | '2-digit',
			second: '2-digit' as 'numeric' | '2-digit',
			hour12: false
		};
		return new Intl.DateTimeFormat('en-GB', options).format(date);
	}

	function formatState(state: string, toDo: boolean): string {
		if (state.startsWith('en:')) {
			state = state.slice(3);
		}
		return state.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
	}

    const doneStates: string[] = [];
    const toDoStates: string[] = [];

    product.states_hierarchy.forEach((state: string) => {
        if (state.includes('to-be-completed')) {
            toDoStates.push(formatState(state, true));
        } else {
            doneStates.push(formatState(state, false));
        }
    });
</script>

<Card>
	<h1 class="text-4xl font-bold">Data sources</h1>
	<p class="mt-4 text-sm text-gray-600 dark:text-gray-300">
		Product added on {convertToCET(product.created_t)} by
		<span class="text-black underline dark:text-white">{product.creator ?? 'unknown'}</span>
	</p>

	<p class="text-sm text-gray-600 dark:text-gray-300">
		Last edit of product page on {convertToCET(product.last_modified_t)} by
		<span class="text-black underline dark:text-white">{product.last_editor ?? 'unknown'}</span>
	</p>

	<p class="text-sm text-gray-600 dark:text-gray-300">
		Product page also edited by:
		{#each product.editors_tags as editor, i}
			<span class="text-black underline dark:text-white">
				{editor}</span
			>{#if i < product.editors_tags.length - 1}{', '}{/if}
		{/each}
	</p>

	<p class="text-sm text-gray-600 dark:text-gray-300">
		Last check of product page on {convertToCET(product.last_checked_t)} by
		<span class="text-black underline dark:text-white">
			{product.checkers_tags[0] ?? 'unknown'}</span
		>
	</p>

	<div class="bg-secondary mt-4 p-3 text-white dark:text-black">
		If the data is incomplete or incorrect, you can complete or correct it by editing this page.
	</div>

	<div class="mt-4">
		<span class="font-bold">Done:</span>
        {doneStates.join(', ')}
	</div>

	<div class="mt-4">
		<span class="font-bold">To do:</span>
        {toDoStates.join(', ')}

	</div>
</Card>
