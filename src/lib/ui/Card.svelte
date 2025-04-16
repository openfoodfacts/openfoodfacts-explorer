<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="dark:bg-base-200 w-full rounded-2xl bg-white p-6 shadow-md">
	{@render children?.()}
</div>
