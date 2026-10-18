<script lang="ts">
	import { compareStore } from '#lib/stores/compareStore.js';
	import { derived } from 'svelte/store';

	import IconMdiScaleBalance from '@iconify-svelte/mdi/scale-balance';
	import { _ } from '#lib/i18n/index.js';

	const count = derived(compareStore, ($compareStore) => $compareStore.length);
	const compareLabel = $derived(
		$_('compare.floating_label', {
			default: 'Compare ({count})',
			values: { count: $count }
		})
	);
</script>

{#if $count > 0}
	<a
		href="/compare"
		class="btn flex items-center gap-2 rounded-full px-3 shadow-lg btn-primary md:px-4"
		title={compareLabel}
		aria-label={compareLabel}
	>
		<IconMdiScaleBalance class="h-5 w-5" aria-hidden="true" />
		<span>{compareLabel}</span>
	</a>
{/if}
