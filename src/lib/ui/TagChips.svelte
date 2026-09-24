<script lang="ts">
	import TagMiniature from '$lib/ui/TagMiniature.svelte';
	import { getTagMiniatureUrl } from '$lib/ui/tagUtils';

	interface TagItem {
		id: string;
		name: string;
		href?: string;
		icon_url?: string;
		image_url?: string;
		miniature?: string;
		icon?: string;
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
			<a class="badge gap-1 wrap-break-word {className}" href={tag.href}>
				{#if getTagMiniatureUrl(tag)}
					<TagMiniature src={getTagMiniatureUrl(tag)} alt={tag.name} size="xs" />
				{/if}
				<span>{tag.name}</span>
			</a>
		{:else}
			<span class="badge gap-1 wrap-break-word {className}">
				{#if getTagMiniatureUrl(tag)}
					<TagMiniature src={getTagMiniatureUrl(tag)} alt={tag.name} size="xs" />
				{/if}
				<span>{tag.name}</span>
			</span>
		{/if}
	{/each}
</div>
