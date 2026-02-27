<script lang="ts">
	import { sanitize } from 'isomorphic-dompurify';

	type Props = {
		dirty: string;
		config?: Parameters<typeof sanitize>[1];
	};
	let { dirty, config = { USE_PROFILES: { html: true } } }: Props = $props();

	let sanitizedHtml = $derived(sanitize(dirty, config));
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html sanitizedHtml}
