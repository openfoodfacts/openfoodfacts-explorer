<script lang="ts">
	import Tags from './Tags.svelte';

	interface Props {
		tagsString: string;
		separator?: string;
		autocomplete?: readonly string[];
	}

	let { tagsString = $bindable(), separator = ',', autocomplete = [] }: Props = $props();
</script>

<Tags
	{autocomplete}
	tags={tagsString.split(separator).filter((str) => str !== '')}
	on:change={(e) => (tagsString = e.detail.tags.join(separator))}
/>
