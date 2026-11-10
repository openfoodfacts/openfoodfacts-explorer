<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
	};

	let { children }: Props = $props();
</script>

<div class="w-full rounded-2xl bg-white p-3 shadow-md sm:p-6 dark:bg-base-200">
	{@render children?.()}
</div>
