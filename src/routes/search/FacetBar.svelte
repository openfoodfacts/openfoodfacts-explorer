<script lang="ts">
	import { onDestroy } from 'svelte';
	import { _ } from '$lib/i18n';
	import type { Facet, FacetItem } from '$lib/api/search';
	import IconMdiPlus from '@iconify-svelte/mdi/plus';
	import IconMdiMagnify from '@iconify-svelte/mdi/magnify';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiChevronDown from '@iconify-svelte/mdi/chevron-down';
	import FacetCard from './FacetCard.svelte';
	import { computeFacetCollections, type FacetsSelection } from '$lib/facets';

	type Props = {
		facets: Record<string, Facet>;
		selectedFacets?: FacetsSelection;
		onToggleInclude: (facetKey: string, itemKey: string) => void;
		onToggleExclude: (facetKey: string, itemKey: string) => void;
		onAddInclude?: (facetKey: string, val: string) => void;
		onAddExclude?: (facetKey: string, val: string) => void;
		onRemoveInclude?: (facetKey: string, val: string) => void;
		onRemoveExclude?: (facetKey: string, val: string) => void;
	};

	let {
		facets,
		selectedFacets = {},
		onToggleInclude,
		onToggleExclude,
		onAddInclude = () => {},
		onAddExclude = () => {},
		onRemoveInclude = () => {},
		onRemoveExclude = () => {}
	}: Props = $props();

	let openDropdownKey = $state<string | null>(null);
	let customFacetKeys = $state<string[]>([]);

	let addPickerQuery = $state('');
	let addPickerElement: HTMLDetailsElement | null = $state(null);
	let addPickerSummaryElement: HTMLElement | null = $state(null);
	let addPickerInput: HTMLInputElement | null = $state(null);
	let addPickerMobileStyle = $state('');

	let collections = $derived(
		computeFacetCollections(facets, selectedFacets, customFacetKeys, addPickerQuery, (k, opt) =>
			$_(k, opt)
		)
	);

	let allFreeTextFacets = $derived(collections.allFreeTextFacets);
	let allAggregatedFacets = $derived(collections.allAggregatedFacets);
	let availableCatalogFacets = $derived(collections.availableCatalogFacets);
	let filteredCatalogFacets = $derived(collections.filteredCatalogFacets);
	let groupedCatalogFacets = $derived(collections.groupedCatalogFacets);

	function updateAddPickerPosition() {
		if (addPickerElement?.open && addPickerSummaryElement && window.innerWidth < 768) {
			const rect = addPickerSummaryElement.getBoundingClientRect();
			const dropdownWidth = Math.max(rect.width, 260);
			const overflowRight = rect.left + dropdownWidth > window.innerWidth - 16;
			const openUpward = rect.bottom > window.innerHeight - 300;

			const horizontalStyle = overflowRight
				? `right: 16px; left: auto;`
				: `left: ${Math.max(16, rect.left)}px; right: auto;`;

			const verticalStyle = openUpward
				? `bottom: ${window.innerHeight - rect.top + 4}px; top: auto;`
				: `top: ${rect.bottom + 4}px; bottom: auto;`;

			addPickerMobileStyle = `${verticalStyle} ${horizontalStyle} width: ${dropdownWidth}px; z-index: 60;`;
		} else {
			addPickerMobileStyle = '';
		}
	}

	function handleRemoveFacet(key: string) {
		customFacetKeys = customFacetKeys.filter((k) => k !== key);
		if (openDropdownKey === key) {
			openDropdownKey = null;
		}
	}

	function handleAddFacet(key: string) {
		if (!customFacetKeys.includes(key)) {
			customFacetKeys.push(key);
		}
		openDropdownKey = key;
		if (addPickerElement) {
			addPickerElement.open = false;
		}
		addPickerQuery = '';
		addPickerMobileStyle = '';
	}

	function handleToggleAddPicker() {
		if (addPickerElement?.open) {
			openDropdownKey = '__add_picker__';
			updateAddPickerPosition();
			window.addEventListener('scroll', updateAddPickerPosition, { passive: true });
			window.addEventListener('resize', updateAddPickerPosition, { passive: true });
			setTimeout(() => {
				addPickerInput?.focus();
			}, 50);
		} else {
			if (openDropdownKey === '__add_picker__') {
				openDropdownKey = null;
			}
			addPickerQuery = '';
			addPickerMobileStyle = '';
			if (typeof window !== 'undefined') {
				window.removeEventListener('scroll', updateAddPickerPosition);
				window.removeEventListener('resize', updateAddPickerPosition);
			}
		}
	}

	$effect(() => {
		if (addPickerElement && addPickerElement.open !== (openDropdownKey === '__add_picker__')) {
			addPickerElement.open = openDropdownKey === '__add_picker__';
			if (openDropdownKey === '__add_picker__') {
				updateAddPickerPosition();
				window.addEventListener('scroll', updateAddPickerPosition, { passive: true });
				window.addEventListener('resize', updateAddPickerPosition, { passive: true });
			} else {
				addPickerMobileStyle = '';
			}
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('scroll', updateAddPickerPosition);
			window.removeEventListener('resize', updateAddPickerPosition);
		}
	});
</script>

<div
	class="flex w-full max-w-full scrollbar-none items-center gap-2 pb-0.5 max-md:flex-nowrap max-md:overflow-x-auto max-md:has-[details[open]]:overflow-x-hidden md:flex-wrap md:justify-center md:gap-4 md:overflow-visible"
>
	{#each Object.entries(allAggregatedFacets) as [facetKey, facet] (facetKey)}
		{@const sel = selectedFacets[facetKey]}
		{@const selectedInclude =
			sel?.include ?? facet.items.filter((item) => item.selected).map((item) => item.key)}
		{@const selectedExclude = sel?.exclude ?? []}
		<FacetCard
			{facet}
			{selectedInclude}
			{selectedExclude}
			isOpen={openDropdownKey === facetKey}
			onRemoveFacet={customFacetKeys.includes(facetKey)
				? () => handleRemoveFacet(facetKey)
				: undefined}
			onToggleOpen={(open) => {
				if (open) {
					openDropdownKey = facetKey;
				} else if (openDropdownKey === facetKey) {
					openDropdownKey = null;
				}
			}}
			onToggleInclude={(item: FacetItem) => onToggleInclude(facetKey, item.key)}
			onToggleExclude={(item: FacetItem) => onToggleExclude(facetKey, item.key)}
		/>
	{/each}

	{#each allFreeTextFacets as freeFacet (freeFacet.key)}
		{@const sel = selectedFacets[freeFacet.key]}
		{@const selectedInclude = sel?.include ?? []}
		{@const selectedExclude = sel?.exclude ?? []}
		<FacetCard
			isFreeText={true}
			labelKey={freeFacet.labelKey}
			defaultLabel={freeFacet.defaultLabel}
			placeholder={freeFacet.placeholder}
			{selectedInclude}
			{selectedExclude}
			isOpen={openDropdownKey === freeFacet.key}
			onRemoveFacet={customFacetKeys.includes(freeFacet.key)
				? () => handleRemoveFacet(freeFacet.key)
				: undefined}
			onToggleOpen={(open) => {
				if (open) {
					openDropdownKey = freeFacet.key;
				} else if (openDropdownKey === freeFacet.key) {
					openDropdownKey = null;
				}
			}}
			onAddInclude={(val) => onAddInclude(freeFacet.key, val)}
			onAddExclude={(val) => onAddExclude(freeFacet.key, val)}
			onRemoveInclude={(val) => onRemoveInclude(freeFacet.key, val)}
			onRemoveExclude={(val) => onRemoveExclude(freeFacet.key, val)}
		/>
	{/each}

	<!-- Add Facet Pill for Mobile/Tablet view -->
	{#if availableCatalogFacets.length > 0}
		<details
			class="dropdown relative shrink-0 open:z-50"
			bind:this={addPickerElement}
			open={openDropdownKey === '__add_picker__'}
			ontoggle={handleToggleAddPicker}
		>
			<summary
				bind:this={addPickerSummaryElement}
				class="sm:rounded-btn btn flex w-auto min-w-[130px] shrink-0 items-center justify-between gap-1.5 rounded-full px-3 text-xs sm:text-sm md:w-60 md:px-4"
			>
				<span
					>{$_('search.add_facet_button', { default: 'Add facet' })}
					({availableCatalogFacets.length})</span
				>
				<IconMdiChevronDown class="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
			</summary>

			<div
				style={addPickerMobileStyle}
				class="dropdown-content absolute top-full left-0 z-50 mt-1 w-full max-w-[calc(100vw-2rem)] min-w-[240px] rounded-box border border-base-300 bg-base-100 p-2.5 shadow-xl max-md:fixed md:w-60"
			>
				<div class="mb-2 flex items-center justify-between gap-1 border-b border-base-300/60 pb-2">
					<div class="flex items-center gap-1.5 text-xs font-semibold text-base-content">
						<IconMdiPlus class="h-3.5 w-3.5 text-primary" />
						<span>{$_('search.available_facets', { default: 'Available facets' })}</span>
					</div>
					<button
						type="button"
						class="cursor-pointer rounded-md p-0.5 text-base-content/50 hover:bg-base-200 hover:text-base-content"
						onclick={() => {
							if (addPickerElement) addPickerElement.open = false;
							openDropdownKey = null;
						}}
						aria-label={$_('search.close', { default: 'Close' })}
					>
						<IconMdiClose class="h-3.5 w-3.5" />
					</button>
				</div>

				<!-- Search filter input -->
				<div class="relative mb-2 w-full">
					<IconMdiMagnify class="absolute top-2 left-2 h-3.5 w-3.5 text-base-content/40" />
					<input
						bind:this={addPickerInput}
						type="text"
						placeholder={$_('search.search_available_facets', {
							default: 'Filter available facets...'
						})}
						class="input-bordered input box-border w-full rounded-md bg-base-100 pl-7 text-xs input-xs"
						bind:value={addPickerQuery}
					/>
					{#if addPickerQuery}
						<button
							type="button"
							class="absolute top-1.5 right-1.5 text-base-content/40 hover:text-base-content"
							onclick={() => (addPickerQuery = '')}
						>
							<IconMdiClose class="h-3 w-3" />
						</button>
					{/if}
				</div>

				<!-- Facets List Grouped by Category -->
				<div class="max-h-56 scrollbar-thin overflow-y-auto pr-0.5">
					{#if filteredCatalogFacets.length === 0}
						<div class="py-4 text-center text-xs text-base-content/60">
							{$_('search.no_matching_facets', { default: 'No matching facets' })}
						</div>
					{:else}
						{#each Object.entries(groupedCatalogFacets) as [category, items] (category)}
							<div class="mb-2 last:mb-0">
								<div
									class="px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-base-content/50 uppercase"
								>
									{category}
								</div>
								<div class="mt-0.5 flex flex-col gap-0.5">
									{#each items as item (item.key)}
										{@const ItemIcon = item.icon}
										<button
											type="button"
											class="flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1 text-left text-xs font-medium text-base-content transition-colors hover:bg-primary/10 hover:text-primary"
											onclick={() => handleAddFacet(item.key)}
										>
											<div class="flex items-center gap-2 truncate">
												<ItemIcon class="h-3.5 w-3.5 shrink-0 text-base-content/70" />
												<span class="truncate">
													{$_(item.labelKey, { default: item.defaultLabel })}
												</span>
											</div>
											<IconMdiPlus class="h-3.5 w-3.5 shrink-0 text-primary" />
										</button>
									{/each}
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</details>
	{/if}
</div>
