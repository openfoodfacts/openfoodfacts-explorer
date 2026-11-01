<script lang="ts">
	import Tags from './Tags.svelte';

	type Props = {
		tagsString: string;
		separator?: string;
		autocomplete?: readonly string[];
		getSuggestions?: (query: string) => Promise<readonly string[]>;
		placeholder?: string;
		onChange?: (value: string) => void;
	};

	let {
		tagsString,
		separator = ',',
		autocomplete = [],
		getSuggestions,
		placeholder,
		onChange
	}: Props = $props();
</script>

<Tags
	{autocomplete}
	{getSuggestions}
	{placeholder}
	tags={tagsString?.split(separator)?.filter((str) => str !== '') ?? []}
	onChange={(tags) => onChange?.(tags.join(separator))}
/>
