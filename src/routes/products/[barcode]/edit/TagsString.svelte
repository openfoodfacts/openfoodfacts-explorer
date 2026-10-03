<script lang="ts">
	import Tags from './Tags.svelte';

	type Props = {
		tagsString: string;
		separator?: string;
		autocomplete?: readonly string[];
		placeholder?: string;
		onChange?: (value: string) => void;
		highlightEmpty?: boolean;
		highlightSeverity?: 'error' | 'warning' | 'info' | '';
		highlightMessage?: string;
	};

	let {
		tagsString,
		separator = ',',
		autocomplete = [],
		placeholder,
		onChange,
		highlightEmpty = false,
		highlightSeverity = '',
		highlightMessage = ''
	}: Props = $props();
</script>

<Tags
	{autocomplete}
	{placeholder}
	tags={tagsString?.split(separator)?.filter((str) => str !== '') ?? []}
	onChange={(tags) => onChange?.(tags.join(separator))}
	{highlightEmpty}
	{highlightSeverity}
	{highlightMessage}
/>
