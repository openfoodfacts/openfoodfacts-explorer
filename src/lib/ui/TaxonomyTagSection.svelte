<script lang="ts">
	import { _ } from '$lib/i18n';
	import { preferences } from '$lib/settings';
	import { type Taxonomy, type TaxoNode, getOrDefault } from '$lib/api';
	import TagChipList from './TagChipList.svelte';

	type Props = {
		titleKey: string;
		defaultTitle: string;
		tags: string[] | undefined;
		taxonomyPromise: Promise<Taxonomy<TaxoNode>>;
		facetType?: string;
	};

	let { titleKey, defaultTitle, tags, taxonomyPromise, facetType }: Props = $props();
	let { lang } = $derived($preferences);

	function localizeTags(
		taxonomy: Taxonomy<TaxoNode> | null | undefined,
		tags: string[] | undefined
	): { id: string; name: string }[] {
		if (!tags) return [];
		return tags.map((tag) => ({
			id: tag,
			name:
				(taxonomy && taxonomy[tag] != null ? getOrDefault(taxonomy[tag].name, lang) : tag) ?? tag
		}));
	}
</script>

{#if tags && tags.length > 0}
	{#await taxonomyPromise}
		<div class="mb-2">
			<div class="text-secondary mb-2 text-sm font-bold">
				{$_(titleKey, { default: defaultTitle })}
			</div>
			<div class="skeleton h-6 w-full"></div>
		</div>
	{:then taxonomy}
		<TagChipList
			title={$_(titleKey, { default: defaultTitle })}
			tags={localizeTags(taxonomy, tags)}
			{facetType}
		/>
	{:catch}
		<TagChipList
			title={$_(titleKey, { default: defaultTitle })}
			tags={localizeTags(null, tags)}
			{facetType}
		/>
	{/await}
{/if}
