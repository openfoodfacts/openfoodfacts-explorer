<script lang="ts">
	interface TagItem {
		id: string;
		name: string;
	}

	type Props = {
		tags: TagItem[];
		facetType?: string;
		badgeClass?: string;
	};

	let { tags = [], facetType, badgeClass = '' }: Props = $props();
</script>

{#if tags && tags.length > 0}
	<div class="flex flex-wrap justify-center gap-1 md:justify-start">
		{#each tags as tag (tag.id)}
			{#if facetType}
				<a class="badge wrap-break-word {badgeClass}" href="/facets/{facetType}/{tag.id}">
					{tag.name}
				</a>
			{:else}
				<span class="badge wrap-break-word {badgeClass}">
					{tag.name}
				</span>
			{/if}
		{/each}
	</div>
{/if}
