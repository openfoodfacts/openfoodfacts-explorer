<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		compactMobile?: boolean;
	};

	let { children, compactMobile = false }: Props = $props();
</script>

<div
	class={[
		'w-full rounded-2xl bg-white shadow-md dark:bg-base-200',
		compactMobile ? 'p-3 sm:p-6' : 'p-6'
	]}
>
	{@render children?.()}
</div>
