<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
		marginBottom?: number;
	}

	let { children, marginBottom }: Props = $props();

	const marginBottomClass = marginBottom != null ? `mb-${marginBottom}` : '';
</script>

<div class="dark:bg-base-200 w-full rounded-2xl bg-white p-6 shadow-md {marginBottomClass}">
	{@render children?.()}
</div>
