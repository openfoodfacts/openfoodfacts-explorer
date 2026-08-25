<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { FacetResult } from '$lib/api/search';
	import type { FacetsSelection } from '$lib/facets';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiFilterOffOutline from '@iconify-svelte/mdi/filter-off-outline';

	type Props = {
		selectedFacets: FacetsSelection;
		facets?: FacetResult;
		onRemoveInclude: (facetKey: string, itemKey: string) => void;
		onRemoveExclude: (facetKey: string, itemKey: string) => void;
		onClearAll: () => void;
	};

	let { selectedFacets, facets, onRemoveInclude, onRemoveExclude, onClearAll }: Props = $props();

	type FilterChip = {
		facetKey: string;
		facetLabel: string;
		itemKey: string;
		itemLabel: string;
		type: 'include' | 'exclude';
	};

	function getItemName(facetKey: string, itemKey: string): string {
		if (facets && facets[facetKey]) {
			const item = facets[facetKey].items.find((i) => i.key === itemKey);
			if (item) return item.name;
		}
		return itemKey;
	}

	function getFacetLabel(facetKey: string): string {
		const translated = $_(`facets.${facetKey}`, { default: '' });
		if (translated) return translated;

		if (facets && facets[facetKey] && facets[facetKey].name !== facetKey) {
			return facets[facetKey].name;
		}
		return facetKey.replace(/_/g, ' ');
	}

	let activeChips = $derived.by<FilterChip[]>(() => {
		const chips: FilterChip[] = [];
		for (const [facetKey, selection] of Object.entries(selectedFacets)) {
			const label = getFacetLabel(facetKey);
			if (selection.include) {
				for (const itemKey of selection.include) {
					chips.push({
						facetKey,
						facetLabel: label,
						itemKey,
						itemLabel: getItemName(facetKey, itemKey),
						type: 'include'
					});
				}
			}
			if (selection.exclude) {
				for (const itemKey of selection.exclude) {
					chips.push({
						facetKey,
						facetLabel: label,
						itemKey,
						itemLabel: getItemName(facetKey, itemKey),
						type: 'exclude'
					});
				}
			}
		}
		return chips;
	});
</script>

{#if activeChips.length > 0}
	{@const includeCount = activeChips.filter((c) => c.type === 'include').length}
	{@const excludeCount = activeChips.filter((c) => c.type === 'exclude').length}

	<!-- Desktop view-->
	<div
		class="my-3 hidden flex-wrap items-center gap-2 rounded-lg border border-base-300 bg-base-100 p-3 shadow-2xs md:flex"
	>
		<span class="text-xs font-semibold tracking-wider text-base-content/60 uppercase">
			{$_('search.active_filters', { default: 'Active Filters' })}:
		</span>

		{#each activeChips as chip (chip.type + ':' + chip.facetKey + ':' + chip.itemKey)}
			{#if chip.type === 'include'}
				<span class="badge gap-1.5 py-3 text-xs font-medium shadow-2xs badge-primary">
					<span class="opacity-80">{chip.facetLabel}:</span>
					<span>{chip.itemLabel}</span>
					<button
						type="button"
						class="ml-0.5 cursor-pointer rounded-full p-0.5 hover:bg-primary-content/20"
						onclick={() => onRemoveInclude(chip.facetKey, chip.itemKey)}
						aria-label={$_('search.remove_include_name', {
							default: 'Remove {name} filter',
							values: { name: chip.itemLabel }
						})}
					>
						<IconMdiClose class="h-3.5 w-3.5" />
					</button>
				</span>
			{:else}
				<span class="badge gap-1.5 py-3 text-xs font-medium shadow-2xs badge-error">
					<span class="opacity-80"
						>{$_('search.not_prefix', { default: 'NOT' })} {chip.facetLabel}:</span
					>
					<span>{chip.itemLabel}</span>
					<button
						type="button"
						class="ml-0.5 cursor-pointer rounded-full p-0.5 hover:bg-error-content/20"
						onclick={() => onRemoveExclude(chip.facetKey, chip.itemKey)}
						aria-label={$_('search.remove_exclude_name', {
							default: 'Remove exclude {name} filter',
							values: { name: chip.itemLabel }
						})}
					>
						<IconMdiClose class="h-3.5 w-3.5" />
					</button>
				</span>
			{/if}
		{/each}

		<button
			type="button"
			class="btn ml-auto gap-1 btn-ghost text-xs text-base-content/70 btn-xs hover:text-error"
			onclick={onClearAll}
		>
			<IconMdiFilterOffOutline class="h-3.5 w-3.5" />
			<span>{$_('search.clear_all', { default: 'Clear All' })}</span>
		</button>
	</div>

	<!-- Mobile view -->
	<details
		class="group my-3 rounded-lg border border-base-300 bg-base-100 p-3 shadow-2xs md:hidden"
		open
	>
		<summary class="flex cursor-pointer list-none items-center justify-between gap-2 select-none">
			<div class="flex items-center gap-2">
				<span class="text-xs font-semibold tracking-wider text-base-content/60 uppercase">
					{$_('search.active_filters', { default: 'Active Filters' })}
				</span>
				<span class="badge badge-sm font-medium">
					{activeChips.length}
				</span>
				{#if includeCount > 0}
					<span class="badge badge-xs text-[10px] font-bold badge-success">+{includeCount}</span>
				{/if}
				{#if excludeCount > 0}
					<span class="badge badge-xs text-[10px] font-bold badge-error">-{excludeCount}</span>
				{/if}
			</div>

			<div class="flex items-center gap-2">
				<button
					type="button"
					class="btn gap-1 btn-ghost text-xs text-base-content/70 btn-xs hover:text-error"
					onclick={(e) => {
						e.stopPropagation();
						onClearAll();
					}}
				>
					<IconMdiFilterOffOutline class="h-3.5 w-3.5" />
					<span>{$_('search.clear_all', { default: 'Clear All' })}</span>
				</button>
				<span class="text-xs text-base-content/50 transition-transform group-open:rotate-180"
					>▼</span
				>
			</div>
		</summary>

		<div class="mt-3 flex flex-col gap-2">
			{#each activeChips as chip (chip.type + ':' + chip.facetKey + ':' + chip.itemKey)}
				{#if chip.type === 'include'}
					<span
						class="badge flex w-full items-center justify-between gap-1.5 py-3 text-xs font-medium shadow-2xs badge-primary"
					>
						<span class="truncate">
							<span class="opacity-80">{chip.facetLabel}:</span>
							<span>{chip.itemLabel}</span>
						</span>
						<button
							type="button"
							class="ml-1 shrink-0 cursor-pointer rounded-full p-0.5 hover:bg-primary-content/20"
							onclick={() => onRemoveInclude(chip.facetKey, chip.itemKey)}
							aria-label={$_('search.remove_include_name', {
								default: 'Remove {name} filter',
								values: { name: chip.itemLabel }
							})}
						>
							<IconMdiClose class="h-3.5 w-3.5" />
						</button>
					</span>
				{:else}
					<span
						class="badge flex w-full items-center justify-between gap-1.5 py-3 text-xs font-medium shadow-2xs badge-error"
					>
						<span class="truncate">
							<span class="opacity-80"
								>{$_('search.not_prefix', { default: 'NOT' })} {chip.facetLabel}:</span
							>
							<span>{chip.itemLabel}</span>
						</span>
						<button
							type="button"
							class="ml-1 shrink-0 cursor-pointer rounded-full p-0.5 hover:bg-error-content/20"
							onclick={() => onRemoveExclude(chip.facetKey, chip.itemKey)}
							aria-label={$_('search.remove_exclude_name', {
								default: 'Remove exclude {name} filter',
								values: { name: chip.itemLabel }
							})}
						>
							<IconMdiClose class="h-3.5 w-3.5" />
						</button>
					</span>
				{/if}
			{/each}
		</div>
	</details>
{/if}
