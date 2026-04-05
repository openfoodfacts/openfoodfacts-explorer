<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		url: string;
		siteId: string | number;
	};

	let { url, siteId }: Props = $props();

	onMount(() => {
		if (!url || !siteId) return;
	});
</script>
