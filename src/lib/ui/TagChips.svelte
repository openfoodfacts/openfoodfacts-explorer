<script lang="ts">
	interface TagItem {
		id: string;
		name: string;
		href?: string;
	}

	type Props = {
		tags: TagItem[];
		class?: string;
	};

	let { tags = [], class: className = '' }: Props = $props();
</script>

<div class="flex flex-wrap justify-center gap-1 md:justify-start">
	{#each tags as tag (tag.id)}
		{#if tag.href}
			<a class="badge wrap-break-word {className}" href={tag.href}>
				{tag.name}
			</a>
		{:else}
			<span class="badge wrap-break-word {className}">
				{tag.name}
			</span>
		{/if}
	{/each}
</div>
