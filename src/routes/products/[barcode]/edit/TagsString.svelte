<script lang="ts">
	import Tags from './Tags.svelte';

	export let tagsString: string;
	export let separator = ',';

	export let autocomplete: readonly string[] = [];
</script>

<Tags
	{autocomplete}
	tags={tagsString.split(separator).filter((str) => str !== '')}
	on:change={(e) => (tagsString = e.detail.tags.join(separator))}
/>
