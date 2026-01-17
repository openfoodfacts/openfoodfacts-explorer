<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { _ } from '$lib/i18n';
	import { personalizedSearch } from '$lib/stores/preferencesStore';

	import KnowledgePanels from '$lib/knowledgepanels/Panels.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Metadata from '$lib/Metadata.svelte';
	import ProductGrid from '$lib/ui/ProductGrid.svelte';
	import PersonalizedSearchToggle from '$lib/ui/PersonalizedSearchToggle.svelte';

	import IconMdiArrowLeft from '@iconify-svelte/mdi/arrow-left';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { facet, results, knowledgePanels, searchOptions, productAttributes } = $derived(data);

	let listView = $state(false);
</script>

<Metadata
	title={$_('facets.facet_value_website_title', {
		values: { facet: facet.name, value: facet.value }
	})}
	description={$_('facets.facet_value_website_description', {
		values: { facet: facet.name, value: facet.value }
	})}
/>

<div class="mb-4">
	<a href={`/facets/${facet.name}`} class="btn btn-ghost w-full">
		<IconMdiArrowLeft class="mr-2" />
		{$_('facets.facet_back_to_overview', { values: { facet: facet.name } })}
	</a>
</div>

<h2 class="my-8 text-3xl font-bold">Exploring {facet.name}: {facet.value}</h2>

<div class="my-8 flex w-full flex-col gap-4">
	{#if Object.entries(knowledgePanels).length > 0}
		<div class="w-full">
			<h2 class="mb-2 grow text-2xl font-bold">Knowledge Panels</h2>
			<KnowledgePanels panels={knowledgePanels} summary={false} />
		</div>
	{/if}

	<div class="w-full space-y-2">
		<h2 class="mb-2 grow text-2xl font-bold">Search Options</h2>
		<div class="grid gap-4 md:grid-cols-3">
			<label class="select w-full">
				<span class="label w-50">{$_('search.page_size')}</span>
				<select
					value={`${results.page_size}`}
					oninput={(e) => {
						const params = new SvelteURLSearchParams(page.url.search);
						params.set('page_size', e.currentTarget.value);
						goto(`?${params}`);
					}}
				>
					<option value="10">10</option>
					<option value="50">50</option>
					<option value="100">100</option>
					<option value="200">200</option>
				</select>
			</label>

			<label class="select w-full">
				<span class="label w-50">{$_('search.sort_by_label')}</span>
				<select
					value={searchOptions.sortBy || 'last_modified_t'}
					oninput={(e) => {
						const params = new SvelteURLSearchParams(page.url.search);
						params.set('sort_by', e.currentTarget.value);
						goto(`?${params}`);
					}}
				>
					<option value="popularity">Popularity</option>
					<option value="nutriscore_score">{$_('nutriscore')}</option>
					<option value="environmental_score_score">{$_('ecoscore')}</option>
					<option value="created_t">{$_('search.creation_date')}</option>
					<option value="last_modified_t">{$_('search.last_modified_date')}</option>
				</select>
			</label>

			<label class="select w-full">
				<span class="label w-50">{$_('search.advanced_view')}</span>
				<select
					value={`${listView}`}
					oninput={(e) => {
						listView = e.currentTarget.value === 'true';
					}}
				>
					<option value="false">Off</option>
					<option value="true">On</option>
				</select>
			</label>
		</div>
	</div>
</div>

<div class="my-8">
	<h2 class="text-2xl font-bold">Products</h2>
	<div class="my-8">
		{#if !listView}
			<!-- Preferences Collapsible Section -->
			<div class="mb-4">
				<PersonalizedSearchToggle></PersonalizedSearchToggle>
			</div>
			<ProductGrid
				products={results.products}
				attributes={productAttributes}
				sortByScore={$personalizedSearch.classifyProductsEnabled}
			/>
		{:else}
			<table class="my-4 table">
				<thead>
					<tr>
						<th>Code</th>
						<th>Name</th>
					</tr>
				</thead>
				<tbody>
					{#each results.products as { product_name, code } (code)}
						<tr class="hover:bg-base-200 cursor-pointer" onclick={() => goto(`/products/${code}`)}>
							<td>
								<a href={`/products/${code}`} class="link">
									{code}
								</a>
							</td>
							<td>
								<a href={`/products/${code}`}>
									{product_name}
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
	<Pagination
		page={results.page}
		totalPages={Math.ceil(results.count / results.page_size)}
		pageUrl={(n) => {
			const params = new SvelteURLSearchParams(page.url.search);
			params.set('page', n.toString());
			return `?${params}`;
		}}
	/>
</div>
