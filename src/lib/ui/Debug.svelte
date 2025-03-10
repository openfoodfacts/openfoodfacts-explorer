<script lang="ts">
	type Props = { title?: string; data: unknown };
	let { title, data }: Props = $props();
</script>

<details>
	<summary>Debug {title ?? ''}</summary>
	<div class="overflow-x-auto">
		<pre class="bg-base-200 rounded-md p-2 whitespace-pre-wrap break-words">{JSON.stringify(data, null, 2)}</pre>
	</div>
</details>
