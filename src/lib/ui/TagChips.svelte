<script lang="ts">
	interface TagItem {
		id: string;
		name: string;
		href?: string;
	}

	type Props = {
		tags: TagItem[];
		class?: string;
		containerClass?: string;
	};

	let { tags = [], class: className = '', containerClass = '' }: Props = $props();
</script>

<div
	class={containerClass.startsWith('contents')
		? containerClass
		: ['flex flex-wrap gap-1', containerClass || 'justify-center md:justify-start']}
>
	{#each tags as tag (tag.id)}
		{#if tag.href}
			<a
				class={[
					'badge h-auto min-h-6 w-fit max-w-full wrap-break-word whitespace-normal',
					className
				]}
				href={tag.href}
			>
				{tag.name}
			</a>
		{:else}
			<span
				class={[
					'badge h-auto min-h-6 w-fit max-w-full wrap-break-word whitespace-normal',
					className
				]}
			>
				{tag.name}
			</span>
		{/if}
	{/each}
</div>
