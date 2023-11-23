<script lang="ts">
	export let title: string | undefined = undefined;
	export let data: unknown;
</script>

<details>
	<summary>Debug {title ?? ''}</summary>
	<code class="rounded-md bg-base-200 p-2">{JSON.stringify(data)}</code>
</details>
