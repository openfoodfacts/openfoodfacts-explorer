<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="w-full rounded-2xl bg-white p-6 shadow-md dark:bg-base-200">
	{@render children?.()}
</div>
