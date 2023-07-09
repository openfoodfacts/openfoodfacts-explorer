<script lang="ts">
	export let title: string | undefined = undefined;
	export let data: unknown;
</script>

<details>
	<summary>Debug {title ?? ''}</summary>
	<code class="bg-base-200 p-2 rounded-md">{JSON.stringify(data)}</code>
</details>
