<script lang="ts">
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import { untrack } from 'svelte';
	import { _ } from '#lib/i18n/index.js';
	import { createSearchApi, type SearchResult } from '#lib/api/search.js';
	import { CHART_FIELDS, parseChartFields, rejectedChartFields } from '#lib/search/chart-fields.js';
	import VegaChart from '#lib/ui/VegaChart.svelte';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiChevronDown from '@iconify-svelte/mdi/chevron-down';

	type Props = { query: string };
	let { query }: Props = $props();

	let fields = $state(parseChartFields(page.url.searchParams.get('charts')));
	let charts = $state<SearchResult['charts']>({});
	let loading = $state(false);
	let latestRequest = 0;
	let addMenu: HTMLDetailsElement | null = $state(null);

	let addableFields = $derived(CHART_FIELDS.filter((field) => !fields.includes(field)));
	let shownFields = $derived(loading ? fields.filter((field) => charts[field]) : fields);

	// Follows a selection that arrives through the URL (back/forward, a shared link). The comparison
	// skips the URL change setFields itself caused, so the charts are not fetched twice.
	$effect(() => {
		const fromUrl = parseChartFields(page.url.searchParams.get('charts'));
		const current = untrack(() => fields);
		if (fromUrl.join() !== current.join()) fields = fromUrl;
	});

	async function loadCharts(q: string, requested: string[]): Promise<SearchResult['charts']> {
		const api = createSearchApi(fetch);
		const ask = (list: string[]) =>
			api.search({
				q,
				langs: ['en'],
				page: 1,
				page_size: 1,
				charts: list.map((field) => ({ chart_type: 'DistributionChart', field }))
			});
		let { data, error } = await ask(requested);
		// One field the search service rejects fails the whole request, so ask again without it.
		const rejected = rejectedChartFields(error);
		if (rejected.length > 0) {
			const accepted = requested.filter((field) => !rejected.includes(field));
			if (accepted.length === 0) return {};
			({ data } = await ask(accepted));
		}
		return (data as SearchResult | undefined)?.charts ?? {};
	}

	// Fetches the selected charts when the selection or the query changes, and ignores a response
	// that arrives after a newer request.
	$effect(() => {
		const request = ++latestRequest;
		if (fields.length === 0) {
			charts = {};
			loading = false;
			return;
		}
		loading = true;
		const q = query;
		const requested = [...fields];
		// Untracked: Sentry's fetch wrapper reads the navigation state, which would refetch on every navigation.
		untrack(() => loadCharts(q, requested))
			.catch((err) => {
				console.error('Chart search failed:', err);
				return {};
			})
			.then((result) => {
				if (request !== latestRequest) return;
				charts = result;
				loading = false;
			});
	});

	function setFields(next: string[]) {
		fields = next;
		// Build on a navigation still in flight (e.g. a filter change) so it is not lost.
		const url = new URL((navigating.to?.url ?? page.url).href);
		url.searchParams.set('charts', next.join(','));
		goto(url, { reset: false, replace: true });
	}

	function label(field: string) {
		return $_(`facets.${field}`, { default: field });
	}
</script>

<div class="flex flex-wrap items-center gap-2">
	{#each fields as field (field)}
		<span class="badge gap-1 badge-primary">
			{label(field)}
			<button
				type="button"
				class="cursor-pointer rounded-full p-1 hover:bg-primary-content/20"
				onclick={() => setFields(fields.filter((f) => f !== field))}
				aria-label={$_('search.remove_chart', {
					default: 'Remove {name} chart',
					values: { name: label(field) }
				})}
			>
				<IconMdiClose class="h-4 w-4" />
			</button>
		</span>
	{/each}
	{#if addableFields.length > 0}
		<details class="dropdown w-full sm:w-auto" bind:this={addMenu}>
			<summary class="btn gap-2 rounded-full btn-outline btn-sm">
				{$_('search.add_chart', { default: 'Add a chart' })}
				<IconMdiChevronDown class="h-4 w-4" />
			</summary>
			<ul
				class="menu dropdown-content z-50 mt-1 max-h-72 w-full flex-nowrap overflow-y-auto rounded-box border border-base-300 bg-base-100 p-2 shadow-xl sm:w-60"
			>
				{#each addableFields as field (field)}
					<li>
						<button
							type="button"
							onclick={() => {
								setFields([...fields, field]);
								if (addMenu) addMenu.open = false;
							}}
						>
							{label(field)}
						</button>
					</li>
				{/each}
			</ul>
		</details>
	{/if}
	{#if loading}
		<span class="loading loading-sm loading-spinner"></span>
	{/if}
</div>

{#each shownFields as field (field)}
	<div
		class="border-t border-base-300 pt-3 md:rounded-lg md:border md:border-base-200 md:bg-base-100 md:p-4 md:shadow-sm"
	>
		{#if charts[field]}
			<VegaChart spec={charts[field]} title={label(field)} />
		{:else}
			<h3 class="mb-2 text-lg font-semibold">{label(field)}</h3>
			<p class="text-sm text-base-content/70">
				{$_('search.chart_unavailable', { default: 'No chart available for this search.' })}
			</p>
		{/if}
	</div>
{/each}
