<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { _ } from '$lib/i18n';
	import type { Facet, FacetItem } from '$lib/api/search';
	import IconMdiChevronDown from '@iconify-svelte/mdi/chevron-down';
	import IconMdiPlus from '@iconify-svelte/mdi/plus';
	import IconMdiMinus from '@iconify-svelte/mdi/minus';

	let {
		facet,
		selectedInclude = [],
		selectedExclude = [],
		onToggleInclude,
		onToggleExclude
	}: {
		facet: Facet;
		selectedInclude?: string[];
		selectedExclude?: string[];
		onToggleInclude: (value: FacetItem) => void;
		onToggleExclude: (value: FacetItem) => void;
	} = $props();

	let showAll: boolean = $state(false);
	let dropdownElement: HTMLDetailsElement;
	let summaryElement: HTMLElement;
	let mobileDropdownStyle = $state('');
	let resizeObserver: ResizeObserver | null = null;

	function updateMobilePosition() {
		if (dropdownElement?.open && summaryElement && window.innerWidth < 768) {
			const rect = summaryElement.getBoundingClientRect();
			const dropdownWidth = 240;
			const overflowRight = rect.left + dropdownWidth > window.innerWidth - 16;
			const openUpward = rect.bottom > window.innerHeight - 300;

			const horizontalStyle = overflowRight
				? `right: 16px; left: auto;`
				: `left: ${Math.max(16, rect.left)}px; right: auto;`;

			const verticalStyle = openUpward
				? `bottom: ${window.innerHeight - rect.top + 4}px; top: auto;`
				: `top: ${rect.bottom + 4}px; bottom: auto;`;

			mobileDropdownStyle = `${verticalStyle} ${horizontalStyle} width: 240px; z-index: 60;`;
		} else {
			mobileDropdownStyle = '';
		}
	}

	// Recalculate position when filters are added/removed and shift DOM layout height
	$effect(() => {
		void selectedInclude.length;
		void selectedExclude.length;
		if (dropdownElement?.open) {
			requestAnimationFrame(updateMobilePosition);
		}
	});

	function handleToggle() {
		if (dropdownElement?.open) {
			updateMobilePosition();
			window.addEventListener('scroll', updateMobilePosition, { passive: true });
			window.addEventListener('resize', updateMobilePosition, { passive: true });

			if (typeof ResizeObserver !== 'undefined') {
				if (!resizeObserver) {
					resizeObserver = new ResizeObserver(() => {
						updateMobilePosition();
					});
				}
				resizeObserver.observe(document.body);
			}
		} else {
			window.removeEventListener('scroll', updateMobilePosition);
			window.removeEventListener('resize', updateMobilePosition);
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
			mobileDropdownStyle = '';
		}
	}

	function toggleShowAll() {
		showAll = !showAll;
	}

	let searchQuery: string = $state('');
	let sortedItems = $derived.by(() => {
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
		let list = sortedItems;
		if (searchQuery) {
			return list.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
		}

		if (!showAll) {
			const activeCount = list.filter(
				(item) => selectedInclude.includes(item.key) || selectedExclude.includes(item.key)
			).length;
			const limit = Math.max(5, activeCount);
			return list.slice(0, limit);
		}

		return list;
	});
</script>

<details
	class="dropdown relative shrink-0 open:z-50"
	bind:this={dropdownElement}
	ontoggle={handleToggle}
>
	<summary
		bind:this={summaryElement}
		class="sm:rounded-btn btn flex w-60 shrink-0 items-center justify-between gap-1.5 rounded-full px-4 text-xs sm:w-64 sm:text-sm"
	>
		<span
			>{$_(`facets.${facet.name}`, { default: facet.name.replace(/_/g, ' ') })} ({facet.items
				.length})</span
		>
		{#if selectedInclude.length > 0 || selectedExclude.length > 0}
			<span class="ml-0.5 badge badge-xs badge-primary">
				{selectedInclude.length + selectedExclude.length}
			</span>
		{/if}
		<span class="grow"></span>
		<IconMdiChevronDown class="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
	</summary>
	<ul
		style={mobileDropdownStyle}
		class="menu dropdown-content absolute top-full left-0 z-50 mt-1 w-60 max-w-[calc(100vw-2rem)] rounded-box border border-base-300 bg-base-100 p-2 shadow-xl max-md:fixed sm:w-64"
	>
		<li>
			<input
				type="text"
				placeholder="Search..."
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
						title={isExcluded ? 'Remove exclude filter' : 'Exclude (NOT) ' + item.name}
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
						title={isIncluded ? 'Remove include filter' : 'Include ' + item.name}
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
					{showAll ? 'Show Less' : 'See All'}
				</button>
			</li>
		{/if}
	</ul>
</details>
