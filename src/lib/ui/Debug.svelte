<script lang="ts">
	type Props = { title?: string; data: unknown };
	let { title, data }: Props = $props();

	let formattedData = $derived(JSON.stringify(data, null, 2));
</script>

<details>
	<summary>Debug {title ?? ''}</summary>
	<div class="overflow-x-auto">
		<pre class="bg-base-200 rounded-md p-2 break-words whitespace-pre-wrap">{formattedData}</pre>
	</div>
</details>
