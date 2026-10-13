<script lang="ts">
	import { compareStore } from '#lib/stores/compareStore.js';
	import { derived } from 'svelte/store';
	import { page } from '$app/state';

	import IconMdiScaleBalance from '@iconify-svelte/mdi/scale-balance';
	import CompareInfo from '#lib/ui/CompareInfo.svelte';
	import { _ } from '#lib/i18n/index.js';

	const count = derived(compareStore, ($compareStore) => $compareStore.length);
	const isOnComparePage = $derived(page.url.pathname === '/compare');
	const isOnSearchPage = $derived(page.url.pathname === '/search');
	const compareLabel = $derived(
		$_('compare.floating_label', {
			default: 'Compare ({count})',
			values: { count: $count }
		})
	);
</script>

{#if $count > 0 && !isOnComparePage}
	<div
		role="group"
		aria-label={$_('compare.page_title', { default: 'Compare Products' })}
		class="fixed left-4 {isOnSearchPage
			? 'bottom-20 z-40 lg:bottom-4 lg:z-50'
			: 'bottom-4 z-50'} flex items-center gap-1 rounded-full border border-base-300 bg-base-100 p-1 shadow-lg"
	>
		<a
			href="/compare"
			class="btn flex items-center gap-2 rounded-full px-3 btn-primary md:px-4"
			title={compareLabel}
			aria-label={compareLabel}
		>
			<IconMdiScaleBalance class="h-5 w-5" aria-hidden="true" />
			<span>{compareLabel}</span>
		</a>
		<CompareInfo
			placement="top"
			text={$_('compare.info_description', {
				default:
					'Compare selected products side by side to explore nutrition, scores, and other available product information.'
			})}
		/>
	</div>
{/if}
