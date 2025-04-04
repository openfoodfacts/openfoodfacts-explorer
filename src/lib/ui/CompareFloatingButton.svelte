<script lang="ts">
	import { compareStore } from '$lib/stores/compareStore';
	import { derived } from 'svelte/store';

	const count = derived(compareStore, ($compareStore) => $compareStore.length);
</script>

{#if $count > 0}
	<a
		href="/compare"
		class="btn btn-primary fixed right-4 bottom-4 z-50 flex items-center rounded-full shadow-lg"
		title="Compare Products"
	>
		<span class="icon-[mdi--compare] mr-1 h-5 w-5"></span>
		Compare ({$count})
	</a>
{/if}
