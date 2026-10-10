<script lang="ts">
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { _ } from '#lib/i18n/index.js';
	import { createSearchApi, type SearchResult } from '#lib/api/search.js';
	import { CHART_FIELDS, parseChartFields } from '#lib/search/chart-fields.js';
	import VegaChart from '#lib/ui/VegaChart.svelte';
	import IconMdiClose from '@iconify-svelte/mdi/close';

	type Props = { query: string };
	let { query }: Props = $props();

	let fields = $state(parseChartFields(page.url.searchParams.get('charts')));
	let charts = $state<SearchResult['charts']>({});
	let loading = $state(false);
	let latestRequest = 0;

	$effect(() => {
		const request = ++latestRequest;
		loading = true;
		createSearchApi(fetch)
			.search({
				q: query,
				langs: ['en'],
				page: 1,
				page_size: 1,
				charts: fields.map((field) => ({ chart_type: 'DistributionChart', field }))
			})
			.then(({ data }) => (data as SearchResult | undefined)?.charts ?? {})
			.catch(() => ({}))
			.then((result) => {
				if (request !== latestRequest) return;
				charts = result;
				loading = false;
			});
	});

	function setFields(next: string[]) {
		fields = next;
		const url = new URL(page.url.href);
		url.searchParams.set('charts', next.join(','));
		replaceState(url, page.state);
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
				class="cursor-pointer rounded-full p-0.5 hover:bg-primary-content/20"
				onclick={() => setFields(fields.filter((f) => f !== field))}
				aria-label={$_('search.remove_chart', {
					default: 'Remove {name} chart',
					values: { name: label(field) }
				})}
			>
				<IconMdiClose class="h-3.5 w-3.5" />
			</button>
		</span>
	{/each}
	<select
		class="select w-full select-sm md:w-64"
		value=""
		aria-label={$_('search.add_chart', { default: 'Add a chart' })}
		oninput={(e) => {
			setFields([...fields, e.currentTarget.value]);
			e.currentTarget.value = '';
		}}
	>
		<option value="" disabled>{$_('search.add_chart', { default: 'Add a chart' })}</option>
		{#each CHART_FIELDS.filter((f) => !fields.includes(f)) as field (field)}
			<option value={field}>{label(field)}</option>
		{/each}
	</select>
	{#if loading}
		<span class="loading loading-sm loading-spinner"></span>
	{/if}
</div>

{#each fields.filter((f) => charts[f]) as field (field)}
	<div
		class="border-t border-base-300 pt-3 md:rounded-lg md:border md:border-base-200 md:bg-base-100 md:p-4 md:shadow-sm"
	>
		<VegaChart spec={charts[field]} title={label(field)} />
	</div>
{/each}
