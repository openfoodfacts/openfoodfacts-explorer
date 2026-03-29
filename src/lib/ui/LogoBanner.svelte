<script lang="ts">
	import IconMdiAlert from '@iconify-svelte/mdi/alert';
	import IconMdiChevronRight from '@iconify-svelte/mdi/chevron-right';
	interface Props {
		logoCount: number;
		barcode: string;
	}

	let { logoCount, barcode }: Props = $props();
</script>

{#if logoCount > 0}
	<a
		href={`/products/${barcode}/logos`}
		class="flex items-center gap-2 rounded-md border-l-4 border-amber-600 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2 text-xs font-semibold text-amber-900 shadow-sm transition-colors hover:text-amber-950 dark:border-amber-500 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-200 dark:hover:text-amber-50"
	>
		<IconMdiAlert class="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
		<span>Annotate {logoCount} logo{logoCount !== 1 ? 's' : ''}</span>
		<IconMdiChevronRight class="h-3 w-3 opacity-60" />
	</a>
{/if}