<script lang="ts">
	export let title: string | undefined = undefined;
	export let data: unknown;
</script>

<details>
	<summary>Debug {title ?? ''}</summary>
	<pre class="rounded-md bg-base-200 p-2">{JSON.stringify(data, null, 2)}</pre>
</details>
