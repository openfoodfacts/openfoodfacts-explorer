<script lang="ts">
	import Tags from './Tags.svelte';

	type Props = {
		tagsString: string;
		separator?: string;
		autocomplete?: readonly string[];
		onChange?: (value: string) => void;
	};

	let { tagsString, separator = ',', autocomplete = [], onChange }: Props = $props();
</script>

<Tags
	{autocomplete}
	tags={tagsString?.split(separator)?.filter((str) => str !== '') ?? []}
	onChange={(tags) => onChange?.(tags.join(separator))}
/>
