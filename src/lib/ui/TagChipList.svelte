<script lang="ts">
	import { preferences } from '$lib/settings';
	import { getOrDefault, type Taxonomy, type TaxoNode } from '$lib/api';

	type Props = {
		title: string;
		tags: string[] | undefined;
		taxonomyPromise: Promise<Taxonomy<TaxoNode>>;
		facetType?: string;
		badgeClass?: string;
	};

	let { title, tags = [], taxonomyPromise, facetType, badgeClass = '' }: Props = $props();

	let { lang } = $derived($preferences);

	function localizedTaxoName(taxonomy: Taxonomy<TaxoNode>, tag: string) {
		return taxonomy[tag] != null ? getOrDefault(taxonomy[tag].name, lang) : tag;
	}
</script>

{#if tags && tags.length > 0}
	<div class="mb-2">
		<div class="text-secondary mb-2 text-sm font-bold">{title}</div>
		<div class="flex flex-wrap justify-center gap-1 md:justify-start">
			{#await taxonomyPromise}
				<div class="skeleton h-6 w-full"></div>
			{:then taxonomy}
				{#each tags as tag (tag)}
					{#if facetType}
						<a class="badge wrap-break-word {badgeClass}" href="/facets/{facetType}/{tag}">
							{localizedTaxoName(taxonomy, tag)}
						</a>
					{:else}
						<span class="badge wrap-break-word {badgeClass}">
							{localizedTaxoName(taxonomy, tag)}
						</span>
					{/if}
				{/each}
			{:catch}
				{#each tags as tag (tag)}
					{#if facetType}
						<a class="badge wrap-break-word {badgeClass}" href="/facets/{facetType}/{tag}">
							{tag}
						</a>
					{:else}
						<span class="badge wrap-break-word {badgeClass}">
							{tag}
						</span>
					{/if}
				{/each}
			{/await}
		</div>
	</div>
{/if}
