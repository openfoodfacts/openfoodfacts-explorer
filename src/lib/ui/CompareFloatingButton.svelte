<script lang="ts">
    import { compareStore } from '$lib/stores/compareStore';
    import { derived } from 'svelte/store';

    const count = derived(compareStore, ($compareStore) => $compareStore.length);
</script>

{#if $count > 0}
    <a
        href="/compare"
        class="btn btn-primary fixed left-4 bottom-4 z-50 flex items-center rounded-full shadow-lg px-3 md:px-4"
        title="Compare Products ({$count})"
        aria-label="Compare Products ({$count})"
    >
        <span class="icon-[mdi--compare] h-5 w-5"></span>
        <span class="hidden md:inline ml-2">Compare ({$count})</span>
    </a>
{/if}