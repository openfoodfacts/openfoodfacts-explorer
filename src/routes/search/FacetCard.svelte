<script lang="ts">
	import { onDestroy } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { _ } from '$lib/i18n';
	import type { Facet, FacetItem } from '$lib/api/search';
	import { getFacetKeyForSearchField } from '$lib/facets';
	import IconMdiChevronDown from '@iconify-svelte/mdi/chevron-down';
	import IconMdiPlus from '@iconify-svelte/mdi/plus';
	import IconMdiMinus from '@iconify-svelte/mdi/minus';
	import IconMdiClose from '@iconify-svelte/mdi/close';

	type Props = {
		facet?: Facet;
		isFreeText?: boolean;
		labelKey?: string;
		defaultLabel?: string;
		placeholder?: string;
		selectedInclude?: string[];
		selectedExclude?: string[];
		isOpen?: boolean;
		onToggleOpen?: (open: boolean) => void;
		onToggleInclude?: (value: FacetItem) => void;
		onToggleExclude?: (value: FacetItem) => void;
		onAddInclude?: (value: string) => void;
		onAddExclude?: (value: string) => void;
		onRemoveInclude?: (value: string) => void;
		onRemoveExclude?: (value: string) => void;
		onRemoveFacet?: () => void;
	};

	let {
		facet,
		isFreeText = false,
		labelKey = '',
		defaultLabel = '',
		placeholder = '',
		selectedInclude = [],
		selectedExclude = [],
		isOpen = false,
		onToggleOpen,
		onToggleInclude = () => {},
		onToggleExclude = () => {},
		onAddInclude = () => {},
		onAddExclude = () => {},
		onRemoveInclude = () => {},
		onRemoveExclude = () => {},
		onRemoveFacet
	}: Props = $props();

	let freeTextInput = $state('');
	let showAll: boolean = $state(false);
	let dropdownElement: HTMLDetailsElement;
	let summaryElement: HTMLElement;
	let mobileDropdownStyle = $state('');
	let resizeObserver: ResizeObserver | null = null;

	function updateMobilePosition() {
		if (dropdownElement?.open && summaryElement && window.innerWidth < 768) {
			const rect = summaryElement.getBoundingClientRect();
			const dropdownWidth = Math.max(rect.width, 220);
			const overflowRight = rect.left + dropdownWidth > window.innerWidth - 16;
			const openUpward = rect.bottom > window.innerHeight - 300;

			const horizontalStyle = overflowRight
				? `right: 16px; left: auto;`
				: `left: ${Math.max(16, rect.left)}px; right: auto;`;

			const verticalStyle = openUpward
				? `bottom: ${window.innerHeight - rect.top + 4}px; top: auto;`
				: `top: ${rect.bottom + 4}px; bottom: auto;`;

			mobileDropdownStyle = `${verticalStyle} ${horizontalStyle} width: ${dropdownWidth}px; z-index: 60;`;
		} else {
			mobileDropdownStyle = '';
		}
	}

	function cleanupListeners() {
		if (typeof window !== 'undefined') {
			window.removeEventListener('scroll', updateMobilePosition);
			window.removeEventListener('resize', updateMobilePosition);
		}
		if (resizeObserver) {
			resizeObserver.disconnect();
			resizeObserver = null;
		}
		mobileDropdownStyle = '';
	}

	onDestroy(() => {
		cleanupListeners();
	});

	// Sync with parent isOpen state
	$effect(() => {
		if (dropdownElement && dropdownElement.open !== isOpen) {
			dropdownElement.open = isOpen;
			if (!isOpen) {
				cleanupListeners();
			}
		}
	});

	// Recalculate position when filters are added/removed and shift DOM layout height
	$effect(() => {
		void selectedInclude.length;
		void selectedExclude.length;
		if (dropdownElement?.open) {
			requestAnimationFrame(updateMobilePosition);
		}
	});

	function handleToggle() {
		const isNowOpen = dropdownElement?.open ?? false;
		if (onToggleOpen && isNowOpen !== isOpen) {
			onToggleOpen(isNowOpen);
		}

		if (isNowOpen) {
			updateMobilePosition();
			window.addEventListener('resize', updateMobilePosition);
			window.addEventListener('scroll', updateMobilePosition, true);

			if (typeof ResizeObserver !== 'undefined') {
				if (!resizeObserver) {
					resizeObserver = new ResizeObserver(() => {
						updateMobilePosition();
					});
				}
				resizeObserver.observe(document.body);
			}
		} else {
			cleanupListeners();
		}
	}

	function toggleShowAll() {
		showAll = !showAll;
	}

	let searchQuery: string = $state('');
	let sortedItems = $derived.by(() => {
		if (isFreeText || !facet) return [];
		const existingKeys = new SvelteSet(facet.items.map((i) => i.key));
		const missingActive: FacetItem[] = [];

		for (const key of selectedInclude) {
			if (!existingKeys.has(key)) {
				missingActive.push({ key, name: key, count: 0, selected: false });
				existingKeys.add(key);
			}
		}

		for (const key of selectedExclude) {
			if (!existingKeys.has(key)) {
				missingActive.push({ key, name: key, count: 0, selected: false });
				existingKeys.add(key);
			}
		}

		const items = [...missingActive, ...facet.items];
		items.sort((a, b) => {
			const aActive = selectedInclude.includes(a.key) || selectedExclude.includes(a.key);
			const bActive = selectedInclude.includes(b.key) || selectedExclude.includes(b.key);
			if (aActive && !bActive) return -1;
			if (!aActive && bActive) return 1;
			return 0;
		});
		return items;
	});

	let visibleValues = $derived.by(() => {
		if (isFreeText) return [];
		const list = sortedItems.filter((i) =>
			i.name.toLowerCase().includes(searchQuery.toLowerCase())
		);
		if (searchQuery != '') {
			return list;
		}
		if (showAll) {
			return list;
		}
		return list.slice(0, 5);
	});

	function handleAddFreeText(type: 'include' | 'exclude') {
		const val = freeTextInput.trim();
		if (!val) return;
		if (type === 'include') {
			onAddInclude(val);
		} else {
			onAddExclude(val);
		}
		freeTextInput = '';
	}

	let titleText = $derived.by(() => {
		if (isFreeText) {
			return $_(labelKey, { default: defaultLabel });
		}
		if (facet) {
			const facetKey = getFacetKeyForSearchField(facet.name);
			return `${$_(`facets.${facetKey}`, { default: facet.name.replace(/_/g, ' ') })} (${facet.items.length})`;
		}
		return '';
	});
</script>

<details
	class="dropdown relative shrink-0 open:z-50"
	bind:this={dropdownElement}
	open={isOpen}
	ontoggle={handleToggle}
>
	<summary
		bind:this={summaryElement}
		title={titleText}
		class="sm:rounded-btn btn flex w-auto min-w-[130px] shrink-0 items-center justify-between gap-1.5 rounded-full px-3 text-xs sm:text-sm md:w-60 md:px-4"
	>
		<span class="truncate" title={titleText}>{titleText}</span>
		<div class="flex items-center gap-1">
			{#if selectedInclude.length > 0 || selectedExclude.length > 0}
				<span class="badge badge-xs badge-primary">
					{selectedInclude.length + selectedExclude.length}
				</span>
			{/if}
			<IconMdiChevronDown class="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
		</div>
	</summary>
	<ul
		style={mobileDropdownStyle}
		class="menu dropdown-content absolute top-full left-0 z-50 mt-1 w-full max-w-[calc(100vw-2rem)] rounded-box border border-base-300 bg-base-100 p-2 shadow-xl max-md:fixed md:w-60"
	>
		{#if onRemoveFacet && selectedInclude.length === 0 && selectedExclude.length === 0}
			<li class="mb-1 border-b border-base-300/40 pb-1">
				<button
					type="button"
					class="btn flex w-full items-center justify-between btn-ghost text-base-content/60 btn-xs hover:text-error"
					onclick={onRemoveFacet}
				>
					<span>{$_('search.remove_filter_section', { default: 'Hide this filter' })}</span>
					<IconMdiClose class="h-3.5 w-3.5" />
				</button>
			</li>
		{/if}
		{#if isFreeText}
			<li>
				<input
					type="text"
					placeholder={placeholder || $_('search.filter_placeholder', { default: 'Filter...' })}
					class="input-bordered input mb-2 w-full input-sm"
					bind:value={freeTextInput}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							const q = freeTextInput.trim();
							if (q) {
								e.preventDefault();
								handleAddFreeText('include');
							}
						}
					}}
				/>
			</li>

			{#if freeTextInput.trim()}
				{@const currentInput = freeTextInput.trim()}
				<li class="my-0.5">
					<div class="flex items-center justify-between gap-2 rounded-md p-1 hover:bg-base-200">
						<button
							type="button"
							class="btn h-6 min-h-6 w-6 shrink-0 rounded-md border border-base-300 p-0 transition-colors btn-error btn-xs"
							onclick={() => handleAddFreeText('exclude')}
							title={$_('search.exclude_item', {
								values: { name: currentInput },
								default: `Exclude (NOT) ${currentInput}`
							})}
							aria-label={$_('search.exclude_item', {
								values: { name: currentInput },
								default: `Exclude (NOT) ${currentInput}`
							})}
						>
							<IconMdiMinus class="h-3.5 w-3.5" />
						</button>

						<span
							class="min-w-0 flex-1 text-center text-xs leading-tight font-medium break-words whitespace-normal text-base-content"
							title={currentInput}
						>
							{currentInput}
						</span>

						<button
							type="button"
							class="btn h-6 min-h-6 w-6 shrink-0 rounded-md border border-base-300 p-0 transition-colors btn-success btn-xs"
							onclick={() => handleAddFreeText('include')}
							title={$_('search.include_item', {
								values: { name: currentInput },
								default: `Include ${currentInput}`
							})}
							aria-label={$_('search.include_item', {
								values: { name: currentInput },
								default: `Include ${currentInput}`
							})}
						>
							<IconMdiPlus class="h-3.5 w-3.5" />
						</button>
					</div>
				</li>
			{/if}

			{#if selectedInclude.length > 0 || selectedExclude.length > 0}
				{@const allValues = Array.from(new Set([...selectedInclude, ...selectedExclude]))}
				{#each allValues as val (val)}
					{@const isIncluded = selectedInclude.includes(val)}
					{@const isExcluded = selectedExclude.includes(val)}
					<li class="my-0.5">
						<div class="flex items-center justify-between gap-2 rounded-md p-1 hover:bg-base-200">
							<button
								type="button"
								class="btn h-6 min-h-6 w-6 shrink-0 rounded-md border border-base-300 p-0 transition-colors btn-xs"
								class:btn-error={isExcluded}
								class:bg-base-200={!isExcluded}
								class:text-base-content={!isExcluded}
								onclick={() => {
									if (isExcluded) {
										onRemoveExclude(val);
									} else {
										if (isIncluded) onRemoveInclude(val);
										onAddExclude(val);
									}
								}}
								aria-label={isExcluded
									? $_('search.remove_exclude', { default: 'Remove exclude filter' })
									: $_('search.exclude_item', {
											values: { name: val },
											default: `Exclude (NOT) ${val}`
										})}
								title={isExcluded
									? $_('search.remove_exclude', { default: 'Remove exclude filter' })
									: $_('search.exclude_item', {
											values: { name: val },
											default: `Exclude (NOT) ${val}`
										})}
							>
								<IconMdiMinus class="h-3.5 w-3.5" />
							</button>

							<span
								class="min-w-0 flex-1 text-center text-xs leading-tight font-medium break-words whitespace-normal text-base-content"
								title={val}
							>
								{val}
							</span>

							<button
								type="button"
								class="btn h-6 min-h-6 w-6 shrink-0 rounded-md border border-base-300 p-0 transition-colors btn-xs"
								class:btn-success={isIncluded}
								class:bg-base-200={!isIncluded}
								class:text-base-content={!isIncluded}
								onclick={() => {
									if (isIncluded) {
										onRemoveInclude(val);
									} else {
										if (isExcluded) onRemoveExclude(val);
										onAddInclude(val);
									}
								}}
								aria-label={isIncluded
									? $_('search.remove_include', { default: 'Remove include filter' })
									: $_('search.include_item', {
											values: { name: val },
											default: `Include ${val}`
										})}
								title={isIncluded
									? $_('search.remove_include', { default: 'Remove include filter' })
									: $_('search.include_item', {
											values: { name: val },
											default: `Include ${val}`
										})}
							>
								<IconMdiPlus class="h-3.5 w-3.5" />
							</button>
						</div>
					</li>
				{/each}
			{/if}
		{:else}
			<li>
				<input
					type="text"
					placeholder={$_('search.search_placeholder', { default: 'Search...' })}
					class="input-bordered input mb-2 w-full input-sm"
					bind:value={searchQuery}
				/>
			</li>
			{#each visibleValues as item (item.key)}
				{@const isIncluded = selectedInclude.includes(item.key)}
				{@const isExcluded = selectedExclude.includes(item.key)}
				<li class="my-0.5">
					<div class="flex items-center justify-between gap-2 rounded-md p-1 hover:bg-base-200">
						<!-- Exclude (-) button on left -->
						<button
							type="button"
							class="btn h-6 min-h-6 w-6 shrink-0 rounded-md border border-base-300 p-0 transition-colors btn-xs"
							class:btn-error={isExcluded}
							class:bg-base-200={!isExcluded}
							class:text-base-content={!isExcluded}
							onclick={() => onToggleExclude(item)}
							aria-label={isExcluded
								? $_('search.remove_exclude', { default: 'Remove exclude filter' })
								: $_('search.exclude_item', {
										values: { name: item.name },
										default: `Exclude (NOT) ${item.name}`
									})}
							title={isExcluded
								? $_('search.remove_exclude', { default: 'Remove exclude filter' })
								: $_('search.exclude_item', {
										values: { name: item.name },
										default: `Exclude (NOT) ${item.name}`
									})}
						>
							<IconMdiMinus class="h-3.5 w-3.5" />
						</button>

						<!-- Item name and count in middle -->
						<span
							class="min-w-0 flex-1 text-center text-xs leading-tight font-medium break-words whitespace-normal text-base-content"
							title={item.name}
						>
							{item.name} <span class="text-base-content/50">({item.count})</span>
						</span>

						<!-- Include (+) button on right -->
						<button
							type="button"
							class="btn h-6 min-h-6 w-6 shrink-0 rounded-md border border-base-300 p-0 transition-colors btn-xs"
							class:btn-success={isIncluded}
							class:bg-base-200={!isIncluded}
							class:text-base-content={!isIncluded}
							onclick={() => onToggleInclude(item)}
							aria-label={isIncluded
								? $_('search.remove_include', { default: 'Remove include filter' })
								: $_('search.include_item', {
										values: { name: item.name },
										default: `Include ${item.name}`
									})}
							title={isIncluded
								? $_('search.remove_include', { default: 'Remove include filter' })
								: $_('search.include_item', {
										values: { name: item.name },
										default: `Include ${item.name}`
									})}
						>
							<IconMdiPlus class="h-3.5 w-3.5" />
						</button>
					</div>
				</li>
			{/each}
			{#if searchQuery == ''}
				<li>
					<button
						type="button"
						class="btn mt-1 w-full btn-link btn-xs"
						onclick={() => toggleShowAll()}
					>
						{showAll
							? $_('search.show_less', { default: 'Show Less' })
							: $_('search.see_all', { default: 'See All' })}
					</button>
				</li>
			{/if}
		{/if}
	</ul>
</details>
