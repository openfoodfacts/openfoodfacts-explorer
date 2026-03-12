<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { searchFilters, resetFilters, type SearchFiltersState } from '$lib/stores/searchFilters';
	import { _ } from '$lib/i18n';

	import IconMdiFilterVariant from '@iconify-svelte/mdi/filter-variant';
	import IconMdiClose from '@iconify-svelte/mdi/close';

	const GRADES = ['a', 'b', 'c', 'd', 'e'];

	const COUNTRIES = [
		{ label: 'France', value: 'france' },
		{ label: 'United States', value: 'united-states' },
		{ label: 'Germany', value: 'germany' },
		{ label: 'Spain', value: 'spain' },
		{ label: 'Italy', value: 'italy' },
		{ label: 'United Kingdom', value: 'united-kingdom' },
		{ label: 'India', value: 'india' },
		{ label: 'Belgium', value: 'belgium' },
		{ label: 'Switzerland', value: 'switzerland' },
		{ label: 'Australia', value: 'australia' }
	];

	let nutriscore = $state('');
	let ecoscore = $state('');
	let country = $state('');
	let category = $state('');
	let filtersOpen = $state(false);

	// Sync local state from URL params on mount / navigation
	$effect(() => {
		const url = new URL(page.url);
		nutriscore = url.searchParams.get('nutriscore') || '';
		ecoscore = url.searchParams.get('ecoscore') || '';
		country = url.searchParams.get('country') || '';
		category = url.searchParams.get('category') || '';

		// Also update the store to stay in sync
		searchFilters.set({ nutriscore, ecoscore, country, category });
	});

	let hasActiveFilters = $derived(
		nutriscore !== '' || ecoscore !== '' || country !== '' || category !== ''
	);

	let activeFilterCount = $derived(
		[nutriscore, ecoscore, country, category].filter((v) => v !== '').length
	);

	function applyFilters() {
		const newUrl = new URL(page.url);

		// Update or remove each filter param
		if (nutriscore) {
			newUrl.searchParams.set('nutriscore', nutriscore);
		} else {
			newUrl.searchParams.delete('nutriscore');
		}

		if (ecoscore) {
			newUrl.searchParams.set('ecoscore', ecoscore);
		} else {
			newUrl.searchParams.delete('ecoscore');
		}

		if (country) {
			newUrl.searchParams.set('country', country);
		} else {
			newUrl.searchParams.delete('country');
		}

		if (category) {
			newUrl.searchParams.set('category', category);
		} else {
			newUrl.searchParams.delete('category');
		}

		// Reset to page 1 when filters change
		newUrl.searchParams.set('page', '1');

		// Update the store
		searchFilters.set({ nutriscore, ecoscore, country, category });

		goto(newUrl.toString());
	}

	function clearFilters() {
		nutriscore = '';
		ecoscore = '';
		country = '';
		category = '';
		resetFilters();
		applyFilters();
	}

	function gradeColor(grade: string): string {
		const colors: Record<string, string> = {
			a: 'bg-success/15 text-success border-success/30',
			b: 'bg-success/10 text-success border-success/20',
			c: 'bg-warning/15 text-warning border-warning/30',
			d: 'bg-error/10 text-error border-error/20',
			e: 'bg-error/15 text-error border-error/30'
		};
		return colors[grade] || '';
	}
</script>

<div class="my-4">
	<!-- Toggle Button -->
	<button
		class="btn btn-sm gap-2 transition-all duration-200"
		class:btn-primary={hasActiveFilters}
		class:btn-outline={!hasActiveFilters}
		onclick={() => (filtersOpen = !filtersOpen)}
		id="search-filters-toggle"
	>
		<IconMdiFilterVariant class="h-4 w-4" />
		Filters
		{#if activeFilterCount > 0}
			<span class="badge badge-sm badge-secondary">{activeFilterCount}</span>
		{/if}
	</button>

	<!-- Filter Panel -->
	{#if filtersOpen}
		<div
			class="bg-base-200/60 border-base-300 mt-3 rounded-xl border p-5 shadow-sm backdrop-blur-sm transition-all duration-300"
			id="search-filters-panel"
		>
			<div class="flex flex-wrap items-end gap-4">
				<!-- NutriScore -->
				<div class="form-control min-w-[150px] flex-1">
					<label class="label" for="filter-nutriscore">
						<span class="label-text text-sm font-semibold">NutriScore</span>
					</label>
					<select
						id="filter-nutriscore"
						class="select select-bordered select-sm w-full"
						bind:value={nutriscore}
					>
						<option value="">All</option>
						{#each GRADES as grade}
							<option value={grade}>{grade.toUpperCase()}</option>
						{/each}
					</select>
				</div>

				<!-- EcoScore -->
				<div class="form-control min-w-[150px] flex-1">
					<label class="label" for="filter-ecoscore">
						<span class="label-text text-sm font-semibold">EcoScore</span>
					</label>
					<select
						id="filter-ecoscore"
						class="select select-bordered select-sm w-full"
						bind:value={ecoscore}
					>
						<option value="">All</option>
						{#each GRADES as grade}
							<option value={grade}>{grade.toUpperCase()}</option>
						{/each}
					</select>
				</div>

				<!-- Country -->
				<div class="form-control min-w-[150px] flex-1">
					<label class="label" for="filter-country">
						<span class="label-text text-sm font-semibold">Country</span>
					</label>
					<select
						id="filter-country"
						class="select select-bordered select-sm w-full"
						bind:value={country}
					>
						<option value="">All</option>
						{#each COUNTRIES as { label, value }}
							<option {value}>{label}</option>
						{/each}
					</select>
				</div>

				<!-- Category -->
				<div class="form-control min-w-[150px] flex-1">
					<label class="label" for="filter-category">
						<span class="label-text text-sm font-semibold">Category</span>
					</label>
					<input
						id="filter-category"
						type="text"
						placeholder="e.g. snacks, beverages"
						class="input input-bordered input-sm w-full"
						bind:value={category}
						onkeydown={(e) => {
							if (e.key === 'Enter') applyFilters();
						}}
					/>
				</div>

				<!-- Action Buttons -->
				<div class="flex gap-2">
					<button
						class="btn btn-primary btn-sm gap-1"
						onclick={applyFilters}
						id="apply-filters-btn"
					>
						Apply
					</button>
					{#if hasActiveFilters}
						<button
							class="btn btn-ghost btn-sm gap-1"
							onclick={clearFilters}
							id="clear-filters-btn"
						>
							<IconMdiClose class="h-4 w-4" />
							Clear
						</button>
					{/if}
				</div>
			</div>

			<!-- Active Filter Badges -->
			{#if hasActiveFilters}
				<div class="mt-3 flex flex-wrap gap-2">
					{#if nutriscore}
						<span class="badge gap-1 border {gradeColor(nutriscore)}">
							NutriScore: {nutriscore.toUpperCase()}
							<button class="btn btn-ghost btn-xs p-0" onclick={() => { nutriscore = ''; applyFilters(); }}>
								<IconMdiClose class="h-3 w-3" />
							</button>
						</span>
					{/if}
					{#if ecoscore}
						<span class="badge gap-1 border {gradeColor(ecoscore)}">
							EcoScore: {ecoscore.toUpperCase()}
							<button class="btn btn-ghost btn-xs p-0" onclick={() => { ecoscore = ''; applyFilters(); }}>
								<IconMdiClose class="h-3 w-3" />
							</button>
						</span>
					{/if}
					{#if country}
						<span class="badge badge-outline gap-1">
							Country: {COUNTRIES.find(c => c.value === country)?.label || country}
							<button class="btn btn-ghost btn-xs p-0" onclick={() => { country = ''; applyFilters(); }}>
								<IconMdiClose class="h-3 w-3" />
							</button>
						</span>
					{/if}
					{#if category}
						<span class="badge badge-outline gap-1">
							Category: {category}
							<button class="btn btn-ghost btn-xs p-0" onclick={() => { category = ''; applyFilters(); }}>
								<IconMdiClose class="h-3 w-3" />
							</button>
						</span>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
