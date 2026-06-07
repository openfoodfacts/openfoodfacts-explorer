<script lang="ts">
	import Tags from './Tags.svelte';

	type Props = {
		tagsString: string;
		separator?: string;
		autocomplete?: readonly string[];
		highlightEmpty?: boolean;
		highlightSeverity?: 'error' | 'warning' | 'info' | '';
		highlightMessage?: string;
	};

	let {
		tagsString = $bindable(),
		separator = ',',
		autocomplete = [],
		highlightEmpty = false,
		highlightSeverity = '',
		highlightMessage = ''
	}: Props = $props();
</script>

<Tags
	{autocomplete}
	tags={tagsString?.split(separator)?.filter((str) => str !== '') ?? []}
	onChange={(tags) => (tagsString = tags.join(separator))}
	{highlightEmpty}
	{highlightSeverity}
	{highlightMessage}
/>
