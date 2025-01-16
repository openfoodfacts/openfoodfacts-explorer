<script lang="ts">
	type Props = { title?: string; data: unknown };
	let { title, data }: Props = $props();
</script>

<details>
	<summary>Debug {title ?? ''}</summary>
	<pre class="rounded-md bg-base-200 p-2">{JSON.stringify(data, null, 2)}</pre>
</details>
