<script lang="ts">
	import { compareStore } from '$lib/stores/compareStore';
	import { derived } from 'svelte/store';
	import { page } from '$app/state';

	import IconMdiCompare from '@iconify-svelte/mdi/compare';

	const count = derived(compareStore, ($compareStore) => $compareStore.length);
	const isOnComparePage = $derived(page.url.pathname === '/compare');
</script>

{#if $count > 0 && !isOnComparePage}
	<a
		href="/compare"
		class="btn btn-primary fixed bottom-4 left-4 z-50 flex items-center rounded-full px-3 shadow-lg md:px-4"
		title="Compare Products ({$count})"
		aria-label="Compare Products ({$count})"
	>
		<IconMdiCompare class="h-5 w-5" />
		<span class="ml-2 hidden md:inline">Compare ({$count})</span>
	</a>
{/if}
