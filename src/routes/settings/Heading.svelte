<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<span class="mt-8 font-semibold first:mt-0">{@render children?.()}</span>
<div></div>
