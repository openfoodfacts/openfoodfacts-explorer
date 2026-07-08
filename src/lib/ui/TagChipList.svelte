<script lang="ts">
	interface TagItem {
		id: string;
		name: string;
	}

	type Props = {
		title: string;
		tags: TagItem[];
		facetType?: string;
		badgeClass?: string;
	};

	let { title, tags = [], facetType, badgeClass = '' }: Props = $props();
</script>

{#if tags && tags.length > 0}
	<div class="mb-2">
		<div class="text-secondary mb-2 text-sm font-bold">{title}</div>
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
	</div>
{/if}
